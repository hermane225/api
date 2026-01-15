import axios from 'axios';
import ping from 'ping';
import dns from 'dns';
import netSnmp from 'net-snmp';
import { exec } from 'child_process';
import { promisify } from 'util';

dns.setServers(['8.8.8.8', '8.8.4.4']);
const execAsync = promisify(exec);

// Configuration
const DEFAULT_CONFIG = {
  apiBase: process.env.API_BASE || "https://api.villageconnecte.voisilab.online",
  apiToken: process.env.API_TOKEN || "",
  credentials: {
    login: process.env.API_LOGIN || "hermane",
    password: process.env.API_PASSWORD || "hermane2005"
  },
  snmpCommunity: process.env.SNMP_COMMUNITY || "public",
  ifIndex: parseInt(process.env.IF_INDEX || "1"),
  monitoringInterval: parseInt(process.env.MONITORING_INTERVAL || "5000"),
  pingTimeout: parseInt(process.env.PING_TIMEOUT || "2"),
  gatewayIpFallback: process.env.GATEWAY_IP_FALLBACK || null
};

const SNMP_OIDS = (ifIndex = DEFAULT_CONFIG.ifIndex) => [
  "1.3.6.1.2.1.1.3.0",                // 0: Uptime
  `1.3.6.1.2.1.2.2.1.10.${ifIndex}`, // 1: InOctets
  `1.3.6.1.2.1.2.2.1.16.${ifIndex}`, // 2: OutOctets
  `1.3.6.1.2.1.2.2.1.8.${ifIndex}`,  // 3: Status Interface
  "1.3.6.1.2.1.6.9.0"                // 4: tcpCurrEstab
];

const PING_OPTS = process.platform === "win32"
  ? { timeout: DEFAULT_CONFIG.pingTimeout, extra: ["-n", "3"] }
  : { timeout: DEFAULT_CONFIG.pingTimeout, extra: ["-c", "3"] };

class BorneMonitor {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.borneId = null;
    this.lastStatus = null;
    this.detectedBorne = null;
    this.monitoringInterval = null;
    this.isRunning = false;
  }

  async authenticate() {
    try {
      const { data } = await axios.post(
        `${this.config.apiBase}/api/auth/login`,
        this.config.credentials,
        { timeout: 5000 }
      );
      this.config.apiToken = data.token;
      console.log("✅ Authentification réussie");
      return true;
    } catch (err) {
      console.error("❌ Erreur authentification:", err.message);
      return false;
    }
  }

  async getNetworkSSID() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('netsh wlan show interfaces');
        const lines = stdout.split('\n');
        
        for (let line of lines) {
          if (line.toLowerCase().includes('ssid') || line.toLowerCase().includes('nom du réseau')) {
            const match = line.split(':')[1];
            if (match) {
              const ssid = match.trim();
              if (ssid && ssid !== '') return ssid;
            }
          }
        }
      }
    } catch (err) {
      console.error("⚠️ Erreur lecture SSID:", err.message);
    }
    return "Réseau";
  }

  async getDefaultGateway() {
    try {
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('ipconfig');
        const lines = stdout.split('\n');
        
        for (let line of lines) {
          if (line.toLowerCase().includes('passerelle') || line.toLowerCase().includes('gateway')) {
            const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (match && match[1] !== '0.0.0.0') {
              console.log(`✅ Gateway détecté (auto): ${match[1]}`);
              return match[1];
            }
          }
        }
      } else {
        const { stdout } = await execAsync('ip route | grep default');
        const match = stdout.match(/default via (\d+\.\d+\.\d+\.\d+)/);
        if (match) {
          console.log(`✅ Gateway détecté (auto): ${match[1]}`);
          return match[1];
        }
      }
    } catch (err) {
      console.error("⚠️ Erreur détection automatique:", err.message);
    }

    // Fallback sur IP manuelle si configurée
    if (this.config.gatewayIpFallback) {
      console.log(`⚡ Utilisation du fallback: ${this.config.gatewayIpFallback}`);
      return this.config.gatewayIpFallback;
    }

    console.error("❌ Aucune gateway détectée et pas de fallback configuré");
    return null;
  }

  async findBorneByIP(ip) {
    try {
      const { data } = await axios.get(`${this.config.apiBase}/api/bornes`, {
        headers: { Authorization: `Bearer ${this.config.apiToken}` },
        timeout: 5000
      });
      
      const borne = data.find(b => b.ip === ip);
      return borne?._id || borne?.id || null;
    } catch (err) {
      console.error("⚠️ Erreur recherche borne:", err.message);
      return null;
    }
  }

  async detectBorne() {
    try {
      const ssid = await this.getNetworkSSID();
      const gateway = await this.getDefaultGateway();
      
      if (!gateway) {
        console.log("❌ Aucune passerelle détectée");
        return null;
      }

      const resPing = await ping.promise.probe(gateway, PING_OPTS);
      
      if (resPing.alive) {
        this.detectedBorne = { name: ssid, ip: gateway };
        
        const existingBorneId = await this.findBorneByIP(gateway);
        if (existingBorneId) {
          this.borneId = existingBorneId;
          console.log(`✅ Borne trouvée (ID: ${this.borneId})`);
        }
        
        return this.detectedBorne;
      } else {
        console.log(`❌ Le routeur ${gateway} ne répond pas au ping`);
      }

      return null;
    } catch (err) {
      console.error("❌ Erreur détection:", err.message);
      return null;
    }
  }

  async checkInternetConnection() {
    try {
      const testHosts = ['8.8.8.8', '1.1.1.1'];
      for (const host of testHosts) {
        const res = await ping.promise.probe(host, {
          timeout: 2,
          extra: process.platform === "win32" ? ["-n", "1"] : ["-c", "1"]
        });
        if (res.alive) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  fetchSnmpStats() {
    return new Promise((resolve, reject) => {
      if (!this.detectedBorne) return reject(new Error("Borne non détectée"));
      
      const session = netSnmp.createSession(this.detectedBorne.ip, this.config.snmpCommunity, { timeout: 1500 });
      session.get(SNMP_OIDS(this.config.ifIndex), (error, varbinds) => {
        session.close();
        if (error) return reject(error);
        try {
          const [uptime, inOctets, outOctets, operStatus, connections] = varbinds.map(v => Number(v.value));
          resolve({
            uptimeSeconds: Math.floor(uptime / 100),
            inOctets,
            outOctets,
            operStatus,
            activeConnections: connections || 0,
          });
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  async computeStatus(resPing, hasInternet) {
    if (!resPing.alive) return "HORS_LIGNE";
    if (!hasInternet) return "INSTABLE";
    return "EN_SERVICE";
  }

  statusIcon(status) {
    if (status === "EN_SERVICE") return "✅";
    if (status === "INSTABLE") return "⚠️";
    return "❌";
  }

  formatBytes(bytes) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  formatUptime(seconds) {
    if (!seconds) return "N/A";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h${m}m`;
  }

  async checkAndUpsert() {
    if (!this.detectedBorne) return;

    try {
      const resPing = await ping.promise.probe(this.detectedBorne.ip, PING_OPTS);
      const hasInternet = await this.checkInternetConnection();

      let snmpStats = null;
      try {
        snmpStats = await this.fetchSnmpStats();
      } catch {}

      const status = await this.computeStatus(resPing, hasInternet);
      const temps = new Date().toLocaleTimeString('fr-FR');
      const icone = this.statusIcon(status);

      if (!this.borneId) {
        const { data } = await axios.post(
          `${this.config.apiBase}/api/bornes`,
          {
            ...this.detectedBorne,
            status,
            lastSeen: new Date(),
            snmp: snmpStats || undefined,
          },
          {
            timeout: 5000,
            headers: {
              Authorization: `Bearer ${this.config.apiToken}`,
              "Content-Type": "application/json"
            }
          }
        );
        this.borneId = data?._id || data?.id;
        this.lastStatus = status;
      } else {
        await axios.put(
          `${this.config.apiBase}/api/bornes/${this.borneId}`,
          {
            status,
            lastSeen: new Date(),
            snmp: snmpStats || undefined,
          },
          {
            timeout: 5000,
            headers: {
              Authorization: `Bearer ${this.config.apiToken}`,
              "Content-Type": "application/json"
            }
          }
        );
      }

      // Afficher à chaque cycle de monitoring
      this.lastStatus = status;
      
      const info = [
        `${icone} [${temps}]`,
        `${this.detectedBorne.name} (${this.detectedBorne.ip})`,
        `→ ${status}`,
        `| Ping: ${resPing.time || 'N/A'}ms`,
        `Internet: ${hasInternet ? 'OK' : 'NON'}`,
        snmpStats ? `| Uptime: ${this.formatUptime(snmpStats.uptimeSeconds)}` : '',
        snmpStats ? `Trafic In: ${this.formatBytes(snmpStats.inOctets)}` : '',
        snmpStats ? `Out: ${this.formatBytes(snmpStats.outOctets)}` : '',
        snmpStats ? `| Périphériques: ${snmpStats.activeConnections}` : '',
      ].filter(Boolean).join(' ');

      console.log(info);

    } catch (err) {
      if (err.response?.status === 401) {
        await this.authenticate();
        return this.checkAndUpsert();
      }
      console.error("❌ Erreur mise à jour:", err.message);
    }
  }

  async start() {
    if (this.isRunning) {
      console.warn("⚠️ Monitoring déjà en cours");
      return false;
    }

    try {
      const authenticated = await this.authenticate();
      if (!authenticated) return false;

      this.detectedBorne = await this.detectBorne();

      if (!this.detectedBorne) {
        console.log("❌ Routeur non détecté");
        return false;
      }

      await this.checkAndUpsert();
      this.monitoringInterval = setInterval(() => this.checkAndUpsert(), this.config.monitoringInterval);
      this.isRunning = true;

      console.log(`✅ Monitoring démarré (intervalle: ${this.config.monitoringInterval}ms)`);
      return true;
    } catch (err) {
      console.error('❌ Erreur démarrage monitoring:', err.message);
      return false;
    }
  }

  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isRunning = false;
    console.log("⏹️ Monitoring arrêté");
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      borneId: this.borneId,
      detectedBorne: this.detectedBorne,
      lastStatus: this.lastStatus
    };
  }
}

export default BorneMonitor;
