import axios from 'axios';
import ping from 'ping';
import dns from 'dns';
import netSnmp from 'net-snmp';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

dns.setServers(['8.8.8.8', '8.8.4.4']);
const execAsync = promisify(exec);

const API_BASE = "http://localhost:5000";
let API_TOKEN = null;

const CREDENTIALS = { login: "hermane", password: "hermane2005" };

const SNMP_COMMUNITY = "public";
const IF_INDEX = 1;
const SNMP_OIDS = [
  "1.3.6.1.2.1.1.3.0",                // 0: Uptime
  `1.3.6.1.2.1.2.2.1.10.${IF_INDEX}`, // 1: InOctets (Trafic Entrant)
  `1.3.6.1.2.1.2.2.1.16.${IF_INDEX}`, // 2: OutOctets (Trafic Sortant)
  `1.3.6.1.2.1.2.2.1.8.${IF_INDEX}`,  // 3: Status Interface
  "1.3.6.1.2.1.6.9.0"                 // 4: tcpCurrEstab (Connexions Actives)
];

const PING_OPTS = process.platform === "win32"
  ? { timeout: 2, extra: ["-n", "3"] }
  : { timeout: 2, extra: ["-c", "3"] };

let borneId = null;
let lastStatus = null;
let isFirstRun = true;
let detectedBorne = null;
let monitoringInterval = null;

async function authenticate() {
  try {
    const { data } = await axios.post(`${API_BASE}/api/auth/login`, CREDENTIALS);
    API_TOKEN = data.token;
    console.log("✅ Authentification réussie");
  } catch (err) {
    console.warn("⚠️ Échec de l'authentification, utilisation du token existant:", err.message);
  }
}

// Récupérer le SSID (nom du réseau WiFi)
async function getNetworkSSID() {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync('netsh wlan show interfaces');
      const lines = stdout.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Chercher la ligne avec "SSID" ou "Nom du réseau"
        if (line.toLowerCase().includes('ssid') || line.toLowerCase().includes('nom du réseau')) {
          const match = line.split(':')[1];
          if (match) {
            const ssid = match.trim();
            if (ssid && ssid !== '') {
              return ssid;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Erreur lecture SSID:", err.message);
  }
  return "Réseau";
}

// Détection automatique du routeur actuel via ipconfig
async function getDefaultGateway() {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync('ipconfig');
      const lines = stdout.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().includes('passerelle') || line.toLowerCase().includes('gateway')) {
          const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (match && match[1] !== '0.0.0.0') {
            return match[1];
          }
        }
      }
    } else {
      const { stdout } = await execAsync('ip route | grep default');
      const match = stdout.match(/default via (\d+\.\d+\.\d+\.\d+)/);
      if (match) return match[1];
    }
  } catch (err) {
    console.error("Erreur lecture ipconfig:", err.message);
  }
  
  return null;
}

// Vérifier si la borne existe déjà dans la BD par IP
async function findBorneByIP(ip) {
  try {
    const { data } = await axios.get(`${API_BASE}/api/bornes`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    
    const borne = data.find(b => b.ip === ip);
    return borne?._id || borne?.id || null;
  } catch (err) {
    console.error("Erreur recherche borne:", err.message);
    return null;
  }
}

// Détection automatique du routeur
async function detectTPLink() {
  try {
    const ssid = await getNetworkSSID();
    const gateway = await getDefaultGateway();
    
    if (!gateway) {
      console.log("❌ Aucune passerelle détectée");
      return null;
    }

    const resPing = await ping.promise.probe(gateway, PING_OPTS);
    
    if (resPing.alive) {
      detectedBorne = { name: ssid, ip: gateway };
      
      // Chercher si la borne existe déjà dans la BD
      const existingBorneId = await findBorneByIP(gateway);
      if (existingBorneId) {
        borneId = existingBorneId;
        console.log(`✅ Borne existante trouvée (ID: ${borneId})`);
      }
      
      return detectedBorne;
    } else {
      console.log(`❌ Le routeur ${gateway} ne répond pas au ping\n`);
    }

    return null;
  } catch (err) {
    console.error("❌ Erreur détection:", err.message);
    return null;
  }
}

// Vérifier si le routeur partage Internet
async function checkInternetConnection() {
  try {
    const testHosts = ['8.8.8.8', '1.1.1.1'];
    for (const host of testHosts) {
      const res = await ping.promise.probe(host, { timeout: 2, extra: process.platform === "win32" ? ["-n", "1"] : ["-c", "1"] });
      if (res.alive) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function fetchSnmpStats() {
  return new Promise((resolve, reject) => {
    if (!detectedBorne) return reject(new Error("Borne non détectée"));
    
    const session = netSnmp.createSession(detectedBorne.ip, SNMP_COMMUNITY, { timeout: 1500 });
    session.get(SNMP_OIDS, (error, varbinds) => {
      session.close();
      if (error) return reject(error);
      try {
        // Ajout de la récupération des connexions (index 4)
        const [uptime, inOctets, outOctets, operStatus, connections] = varbinds.map(v => Number(v.value));
        resolve({
          uptimeSeconds: Math.floor(uptime / 100),
          inOctets,
          outOctets,
          operStatus,
          activeConnections: connections || 0, // Stockage du nombre de connexions
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function computeStatus(resPing, hasInternet) {
  if (!resPing.alive) return "HORS_LIGNE";
  if (!hasInternet) return "INSTABLE";
  return "EN_SERVICE";
}

function statusIcon(status) {
  if (status === "EN_SERVICE") return "✅";
  if (status === "INSTABLE") return "⚠️";
  return "❌";
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(seconds) {
  if (!seconds) return "N/A";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h${m}m`;
}

async function checkAndUpsert() {
  if (!detectedBorne) return;

  try {
    const resPing = await ping.promise.probe(detectedBorne.ip, PING_OPTS);
    const hasInternet = await checkInternetConnection();

    let snmpStats = null;
    try {
      snmpStats = await fetchSnmpStats();
    } catch {}

    const status = await computeStatus(resPing, hasInternet);
    const temps = new Date().toLocaleTimeString('fr-FR');
    const icone = statusIcon(status);

    // Vérifier à nouveau si la borne existe (évite la duplication)
    if (!borneId) {
      const existingBorneId = await findBorneByIP(detectedBorne.ip);
      if (existingBorneId) {
        borneId = existingBorneId;
      }
    }

    if (!borneId) {
      // Créer une nouvelle borne
      const { data } = await axios.post(
        `${API_BASE}/api/bornes`,
        {
          ...detectedBorne,
          status,
          lastSeen: new Date(),
          snmp: snmpStats || undefined,
        },
        { timeout: 5000, headers: { Authorization: `Bearer ${API_TOKEN}`, "Content-Type": "application/json" } }
      );
      borneId = data?._id || data?.id;
      lastStatus = status;
      isFirstRun = false;
    } else {
      // Mettre à jour la borne existante
      await axios.put(
        `${API_BASE}/api/bornes/${borneId}`,
        {
          status,
          lastSeen: new Date(),
          snmp: snmpStats || undefined,
        },
        { timeout: 5000, headers: { Authorization: `Bearer ${API_TOKEN}`, "Content-Type": "application/json" } }
      );
    }

    if (lastStatus === null) {
      lastStatus = status;
    } else if (status !== lastStatus) {
      lastStatus = status;
    }

    const info = [
      `${icone} [${temps}]`,
      `${detectedBorne.name} (${detectedBorne.ip})`,
      `→ ${status}`,
      `| Ping: ${resPing.time || 'N/A'}ms`,
      `Internet: ${hasInternet ? 'OK' : 'NON'}`,
      snmpStats ? `| Uptime: ${formatUptime(snmpStats.uptimeSeconds)}` : '',
      snmpStats ? `Trafic In: ${formatBytes(snmpStats.inOctets)}` : '', // Label plus clair
      snmpStats ? `Out: ${formatBytes(snmpStats.outOctets)}` : '',
      snmpStats ? `| Périphériques/Conns: ${snmpStats.activeConnections}` : '', // Affichage des connexions
    ].filter(Boolean).join(' ');

    process.stdout.write(`\r${info}`.padEnd(150));

  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      await authenticate();
      return checkAndUpsert();
    }
  }
}

export async function startMonitoring() {
  await authenticate();
  detectedBorne = await detectTPLink();

  if (detectedBorne) {
    await checkAndUpsert();
    monitoringInterval = setInterval(checkAndUpsert, 5000);
  } else {
    console.log("❌ Routeur non détecté. Vérifiez votre connexion réseau.");
    throw new Error("Routeur non détecté");
  }
}

export function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

// Lancer automatiquement le script si exécuté directement
const isMainModule = import.meta.url.endsWith(process.argv[1]) || 
                     process.argv[1].includes('monitor.js');

if (isMainModule) {
  startMonitoring().catch(err => {
    console.error('Erreur lors du démarrage du monitoring:', err);
    process.exit(1);
  });
}
