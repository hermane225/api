import axios from 'axios';

const API_BASE = "https://api.villageconnecte.voisilab.online";
let API_TOKEN = null;

// Credentials for testing - using admin first to create a test user if needed
const ADMIN_CREDENTIALS = { login: "hermane", password: "hermane2005" };
const TEST_USER_CREDENTIALS = { login: `testuser_${Date.now()}`, password: "testpass123" };

let testUserId = null;
let testForfaitId = null;
let testCode = null;

async function authenticate(credentials) {
  try {
    console.log(`🔐 Authenticating with ${credentials.login}...`);
    const { data } = await axios.post(`${API_BASE}/api/auth/login`, credentials);
    API_TOKEN = data.token;
    console.log(`✅ Authenticated successfully as ${credentials.login}`);
    console.log(`   User: ${data.user.login}, Role: ${data.user.role}`);
    return data;
  } catch (err) {
    console.error(`❌ Authentication failed:`, err.response?.data || err.message);
    throw err;
  }
}

async function createTestUser() {
  try {
    console.log(`👤 Creating test user...`);
    const { data } = await axios.post(`${API_BASE}/api/users`, {
      login: TEST_USER_CREDENTIALS.login,
      password: TEST_USER_CREDENTIALS.password,
      name: "Test User",
      role: "user"
    }, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    testUserId = data._id || data.id;
    console.log(`✅ Test user created: ${data.login} (ID: ${testUserId})`);
    return data;
  } catch (err) {
    if (err.response?.status === 400 && err.response.data.message.includes('existe déjà')) {
      console.log(`ℹ️ Test user already exists`);
      // Try to find the user
      const users = await axios.get(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` }
      });
      const user = users.data.find(u => u.login === TEST_USER_CREDENTIALS.login);
      if (user) {
        testUserId = user._id || user.id;
        console.log(`✅ Found existing test user (ID: ${testUserId})`);
      }
    } else {
      console.error(`❌ Failed to create test user:`, err.response?.data || err.message);
      throw err;
    }
  }
}

async function createTestForfait() {
  try {
    console.log(`📦 Creating test forfait...`);
    const { data } = await axios.post(`${API_BASE}/api/forfaits`, {
      name: "Test Forfait 1GB",
      description: "Forfait de test pour 1GB",
      price: 5000,
      durationValue: 30,
      category: "internet"
    }, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    testForfaitId = data._id || data.id;
    console.log(`✅ Test forfait created: ${data.name} (ID: ${testForfaitId})`);
    return data;
  } catch (err) {
    console.error(`❌ Failed to create test forfait:`, err.response?.data || err.message);
    throw err;
  }
}

async function testViewForfaits() {
  try {
    console.log(`📋 Testing view forfaits...`);
    const { data } = await axios.get(`${API_BASE}/api/forfaits`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    console.log(`✅ Retrieved ${data.length} forfaits`);
    if (data.length > 0) {
      console.log(`   Sample forfait: ${data[0].name} - ${data[0].price} FCFA`);
      testForfaitId = testForfaitId || data[0]._id || data[0].id;
    }
    return data;
  } catch (err) {
    console.error(`❌ Failed to view forfaits:`, err.response?.data || err.message);
    throw err;
  }
}

async function testPurchaseForfait() {
  try {
    console.log(`🛒 Testing purchase forfait...`);
    const { data } = await axios.post(`${API_BASE}/api/codes/purchase`, {
      forfaitId: testForfaitId
    }, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    console.log(`✅ Purchase successful!`);
    console.log(`   Transaction ID: ${data.transaction._id || data.transaction.id}`);
    console.log(`   Code: ${data.code.code}`);
    console.log(`   Status: ${data.code.status}`);
    testCode = data.code.code;
    return data;
  } catch (err) {
    console.error(`❌ Failed to purchase forfait:`, err.response?.data || err.message);
    throw err;
  }
}

async function testViewCodes() {
  try {
    console.log(`📝 Testing view codes...`);
    const { data } = await axios.get(`${API_BASE}/api/codes`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    console.log(`✅ Retrieved ${data.length} codes`);
    if (data.length > 0) {
      console.log(`   Latest code: ${data[0].code} - Status: ${data[0].status}`);
    }
    return data;
  } catch (err) {
    console.error(`❌ Failed to view codes:`, err.response?.data || err.message);
    throw err;
  }
}

async function testCheckCodeStatus() {
  try {
    console.log(`🔍 Testing check code status...`);
    const { data } = await axios.get(`${API_BASE}/api/codes/check/${testCode}`);
    console.log(`✅ Code status checked:`);
    console.log(`   Code: ${data.code}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Paid: ${data.paid}`);
    console.log(`   Used: ${data.used}`);
    return data;
  } catch (err) {
    console.error(`❌ Failed to check code status:`, err.response?.data || err.message);
    throw err;
  }
}

async function testViewTransactions() {
  try {
    console.log(`💳 Testing view transactions...`);
    const { data } = await axios.get(`${API_BASE}/api/transactions`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });
    console.log(`✅ Retrieved ${data.length} transactions`);
    if (data.length > 0) {
      console.log(`   Latest transaction: ${data[0].amount} FCFA - ${data[0].date}`);
    }
    return data;
  } catch (err) {
    console.error(`❌ Failed to view transactions:`, err.response?.data || err.message);
    throw err;
  }
}

async function runUserFlowTest() {
  try {
    console.log(`🚀 Starting User Flow Test\n`);

    // Step 1: Authenticate as admin and setup test data
    await authenticate(ADMIN_CREDENTIALS);
    await createTestUser();
    await createTestForfait();

    // Step 2: Switch to test user
    console.log(`\n🔄 Switching to test user...`);
    await authenticate(TEST_USER_CREDENTIALS);

    // Step 3: Test the user flow
    await testViewForfaits();
    await testPurchaseForfait();
    await testViewCodes();
    await testCheckCodeStatus();
    await testViewTransactions();

    console.log(`\n🎉 User Flow Test Completed Successfully!`);

  } catch (err) {
    console.error(`\n💥 User Flow Test Failed:`, err.message);
    process.exit(1);
  }
}

// Run the test
runUserFlowTest();
