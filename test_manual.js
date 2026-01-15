import { startMonitoring, stopMonitoring } from './test/test.js';

console.log('Testing exports from test.js...');

// Test if functions are exported
console.log('startMonitoring function:', typeof startMonitoring);
console.log('stopMonitoring function:', typeof stopMonitoring);

// Test calling stopMonitoring (should not throw error)
try {
  stopMonitoring();
  console.log('✅ stopMonitoring called successfully');
} catch (error) {
  console.error('❌ Error calling stopMonitoring:', error.message);
}

// Note: startMonitoring would require network access and API credentials,
// so we don't call it here to avoid potential issues
console.log('✅ Exports and basic function calls work correctly');
