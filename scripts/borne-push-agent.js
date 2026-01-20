import axios from 'axios';
import ping from 'ping';
import netSnmp from 'net-snmp';
import dns from 'dns';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);
const execAsync = promisify(exec);

// Configuration
const BORNE_IP = process.env.BORNE_IP || '192.168.70.2'; // IP du routeur TP-Link local
const BORNE_NAME = process.env.BORNE_NAME || 'UVCI-STAGE';
const SNMP_COMMUNITY = process.env.SNMP_COMMUNITY || 'public';
const IF_INDEX = parseInt(process.env.IF_INDEX || '1');
const PUSH_URL = process.env.API_BASE + '/api/bornes/push/data'; // URL du serveur
const MONITORING_INTERVAL = parseInt(process.env.MONITORING_INTERVAL || '5000');
const PING_TIMEOUT = parseInt(process.env.PING_TIMEOUT || '2');

const SNMP_OIDS = [
  "1.3.6.1.2.1.1.3.0",                // Uptime
  `1.3.6.1.2.1.2.2.1.10.${IF_INDEX}`, // InOctets
  `1.3.6.1.2.1.2.2.1.16.${IF_INDEX}`, // OutOctets
  `1.3.6.1.2.1.2.2.1.8.${IF_INDEX}`,  // Status Interface
  "1.3.6.1.2.1.6.9.0"                 // tcpCurrEstab
];

const PING_OPTS = process.platform === "win32"
  ? { timeout: PING_TIMEOUT, extra: ["-n", "3"] }
  : { timeout: PING_TIMEOUT, extra: ["-c", "3"] };

console.log(`🚀 Agent Borne Push démarré`);
console.log(`📍 Borne: ${BORNE_NAME} (${BORNE_IP})`);
console.log(`🎯 Serveur: ${PUSH_URL}`);
console.log(`⏱️  Intervalle: ${MONITORING_INTERVAL}ms\n`);

// Fetch SNMP Stats
function fetchSnmpStats() {
  return new Promise((resolve, reject) => {
    const session = netSnmp.createSession(BORNE_IP, SNMP_COMMUNITY, { timeout: 1500 });
    session.get(SNMP_OIDS, (error, varbinds) => {
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

// Check Internet Connection
async function checkInternetConnection() {
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

// Compute Status
async function computeStatus(isPingAlive, hasInternet) {
  if (!isPingAlive) return "HORS_LIGNE";
  if (!hasInternet) return "INSTABLE";
  return "EN_SERVICE";
}

// Send Data to Server
async function pushBorneData() {
  try {
    // Ping la borne
    const resPing = await ping.promise.probe(BORNE_IP, PING_OPTS);
    const hasInternet = await checkInternetConnection();

    let snmpStats = null;
    try {
      snmpStats = await fetchSnmpStats();
    } catch (err) {
      console.warn(`⚠️  Erreur SNMP: ${err.message}`);
    }

    const status = await computeStatus(resPing.alive, hasInternet);
    const temps = new Date().toLocaleTimeString('fr-FR');

    // Préparer les données
    const borneData = {
      ip: BORNE_IP,
      name: BORNE_NAME,
      status,
      lastSeen: new Date(),
      snmp: snmpStats || {},
    };

    // Envoyer au serveur
    const response = await axios.post(PUSH_URL, borneData, { timeout: 5000 });

    const icon = status === "EN_SERVICE" ? "✅" : status === "INSTABLE" ? "⚠️" : "❌";
    const ping_ms = resPing.alive ? `${Math.round(resPing.time)}ms` : "N/A";
    const internet = hasInternet ? "OK" : "KO";

    console.log(`${icon} [${temps}] ${BORNE_NAME} (${BORNE_IP}) → ${status} | Ping: ${ping_ms} Internet: ${internet}`);

  } catch (error) {
    console.error(`❌ Erreur push: ${error.message}`);
  }
}

// Start Monitoring
console.log(`📊 Démarrage du monitoring...\n`);
setInterval(pushBorneData, MONITORING_INTERVAL);

// First run immediately
pushBorneData();
