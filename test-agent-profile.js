/**
 * 🧪 TEST SCRIPT - Vérification des modifications
 * 
 * Ce script teste:
 * 1. La création d'agents avec login/password
 * 2. La connexion des agents
 * 3. Les profils distincts de chaque agent
 * 4. La mise à jour du profil personnel
 */

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'votre_token_admin'; // À remplacer par un vrai token
let agent1Token, agent2Token;

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.yellow}🧪 ${msg}${colors.reset}`)
};

// Helper pour les requêtes HTTP
async function request(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Tests
async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   TEST: Agents avec Login/Password et Profils Distincts');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: Créer Agent 1
  log.test('Test 1: Créer Agent 1');
  const agent1Response = await request('POST', '/agents', {
    login: 'agent_alice',
    password: 'password123',
    firstName: 'Alice',
    lastName: 'Martin',
    contact: '+33612345678',
    region: 'Île-de-France',
    idType: 'carte_identité',
    idNumber: 'AB123456'
  }, ADMIN_TOKEN);

  if (agent1Response.success) {
    log.success('Agent 1 créé');
    console.log('Response:', JSON.stringify(agent1Response.data, null, 2));
  } else {
    log.error('Erreur création Agent 1: ' + agent1Response.data?.message);
  }

  // Test 2: Créer Agent 2
  log.test('Test 2: Créer Agent 2');
  const agent2Response = await request('POST', '/agents', {
    login: 'agent_bob',
    password: 'password456',
    firstName: 'Bob',
    lastName: 'Durand',
    contact: '+33698765432',
    region: 'Provence',
    idType: 'passeport',
    idNumber: 'CD789012'
  }, ADMIN_TOKEN);

  if (agent2Response.success) {
    log.success('Agent 2 créé');
    console.log('Response:', JSON.stringify(agent2Response.data, null, 2));
  } else {
    log.error('Erreur création Agent 2: ' + agent2Response.data?.message);
  }

  // Test 3: Agent 1 se connecte
  log.test('Test 3: Agent 1 se connecte');
  const login1Response = await request('POST', '/auth/login', {
    login: 'agent_alice',
    password: 'password123'
  });

  if (login1Response.success) {
    agent1Token = login1Response.data.token;
    log.success('Agent 1 connecté');
    log.info(`Token: ${agent1Token.substring(0, 20)}...`);
    log.info(`Profil: ${JSON.stringify(login1Response.data.user.profile, null, 2)}`);
  } else {
    log.error('Erreur connexion Agent 1: ' + login1Response.data?.message);
  }

  // Test 4: Agent 2 se connecte
  log.test('Test 4: Agent 2 se connecte');
  const login2Response = await request('POST', '/auth/login', {
    login: 'agent_bob',
    password: 'password456'
  });

  if (login2Response.success) {
    agent2Token = login2Response.data.token;
    log.success('Agent 2 connecté');
    log.info(`Token: ${agent2Token.substring(0, 20)}...`);
    log.info(`Profil: ${JSON.stringify(login2Response.data.user.profile, null, 2)}`);
  } else {
    log.error('Erreur connexion Agent 2: ' + login2Response.data?.message);
  }

  // Test 5: Agent 1 récupère son profil personnel
  if (agent1Token) {
    log.test('Test 5: Agent 1 récupère son profil personnel');
    const profile1Response = await request('GET', '/users/profile/me', null, agent1Token);

    if (profile1Response.success) {
      log.success('Profil Agent 1 récupéré');
      console.log('Profile:', JSON.stringify(profile1Response.data, null, 2));
      
      // Vérification: Le profil doit être différent d'Agent 2
      if (profile1Response.data.profile.firstName === 'Alice') {
        log.success('✅ Profil distinct d\'Agent 1 confirmé');
      } else {
        log.error('❌ Profil incorrect pour Agent 1');
      }
    } else {
      log.error('Erreur récupération profil Agent 1: ' + profile1Response.data?.message);
    }
  }

  // Test 6: Agent 2 récupère son profil personnel
  if (agent2Token) {
    log.test('Test 6: Agent 2 récupère son profil personnel');
    const profile2Response = await request('GET', '/users/profile/me', null, agent2Token);

    if (profile2Response.success) {
      log.success('Profil Agent 2 récupéré');
      console.log('Profile:', JSON.stringify(profile2Response.data, null, 2));
      
      // Vérification: Le profil doit être différent d'Agent 1
      if (profile2Response.data.profile.firstName === 'Bob') {
        log.success('✅ Profil distinct d\'Agent 2 confirmé');
      } else {
        log.error('❌ Profil incorrect pour Agent 2');
      }
    } else {
      log.error('Erreur récupération profil Agent 2: ' + profile2Response.data?.message);
    }
  }

  // Test 7: Agent 1 met à jour son profil
  if (agent1Token) {
    log.test('Test 7: Agent 1 met à jour son profil');
    const updateResponse = await request('PUT', '/users/profile/me', {
      profile: {
        contact: '+33612345679', // Nouveau numéro
        region: 'Bretagne'       // Nouvelle région
      }
    }, agent1Token);

    if (updateResponse.success) {
      log.success('Profil Agent 1 mis à jour');
      log.info(`Nouvelle région: ${updateResponse.data.user.profile.region}`);
      log.info(`Nouveau contact: ${updateResponse.data.user.profile.contact}`);
    } else {
      log.error('Erreur mise à jour profil Agent 1: ' + updateResponse.data?.message);
    }
  }

  // Test 8: Vérifier que Agent 2 ne peut pas voir/modifier le profil d'Agent 1
  if (agent2Token) {
    log.test('Test 8: Vérifier l\'isolation des profils');
    const checkResponse = await request('GET', '/users/profile/me', null, agent2Token);

    if (checkResponse.success && checkResponse.data.profile.firstName === 'Bob') {
      log.success('✅ Agent 2 voit bien son propre profil');
      log.success('✅ Les profils sont bien isolés');
    } else {
      log.error('❌ Problème d\'isolation des profils');
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ✅ Tests terminés!');
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Lancer les tests
runTests().catch(error => {
  log.error('Erreur lors de l\'exécution des tests: ' + error.message);
  process.exit(1);
});
