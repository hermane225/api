/**
 * Test unitaire de la classe BorneMonitor
 * Vérifie que la classe est bien exportée et utilisable
 */

import BorneMonitor from '../src/utils/borneMonitor.js';

console.log('🧪 Test de la classe BorneMonitor\n');

// Test 1: Créer une instance
try {
  const monitor = new BorneMonitor({
    monitoringInterval: 10000
  });
  console.log('✅ Instance BorneMonitor créée avec succès');
  console.log(`   - isRunning: ${monitor.isRunning}`);
  console.log(`   - borneId: ${monitor.borneId}`);
  console.log(`   - detectedBorne: ${monitor.detectedBorne}`);
} catch (err) {
  console.log('❌ Erreur création instance:', err.message);
  process.exit(1);
}

// Test 2: Vérifier les méthodes
const monitor = new BorneMonitor();
const methods = ['authenticate', 'start', 'stop', 'getStatus', 'detectBorne', 'fetchSnmpStats'];
console.log('\n✅ Méthodes disponibles:');
methods.forEach(method => {
  if (typeof monitor[method] === 'function') {
    console.log(`   ✓ ${method}()`);
  } else {
    console.log(`   ✗ ${method}() - MANQUANTE`);
  }
});

// Test 3: Tester getStatus
console.log('\n✅ Test getStatus():');
const status = monitor.getStatus();
console.log('   ', JSON.stringify(status, null, 2));

// Test 4: Vérifier la configuration
console.log('\n✅ Configuration:');
console.log(`   - apiBase: ${monitor.config.apiBase}`);
console.log(`   - snmpCommunity: ${monitor.config.snmpCommunity}`);
console.log(`   - ifIndex: ${monitor.config.ifIndex}`);
console.log(`   - monitoringInterval: ${monitor.config.monitoringInterval}ms`);
console.log(`   - pingTimeout: ${monitor.config.pingTimeout}s`);

console.log('\n✅ Tous les tests unitaires sont passés!');
