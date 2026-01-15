/**
 * Script autonome pour le monitoring des bornes
 * Utilisation: node scripts/monitor-standalone.js
 */

import dotenv from 'dotenv';
import BorneMonitor from '../src/utils/borneMonitor.js';

dotenv.config();

const monitor = new BorneMonitor({
  apiBase: process.env.API_BASE,
  apiToken: process.env.API_TOKEN,
  credentials: {
    login: process.env.API_LOGIN,
    password: process.env.API_PASSWORD
  },
  snmpCommunity: process.env.SNMP_COMMUNITY,
  monitoringInterval: parseInt(process.env.MONITORING_INTERVAL || '5000')
});

console.log('🚀 Démarrage du monitoring autonome des bornes...\n');

(async () => {
  const started = await monitor.start();
  
  if (!started) {
    console.error('❌ Impossible de démarrer le monitoring');
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n📴 Arrêt du monitoring...');
    monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n📴 Arrêt du monitoring...');
    monitor.stop();
    process.exit(0);
  });
})();
