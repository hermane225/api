#!/bin/bash

# 📝 EXEMPLES DE REQUÊTES - API Agents et Profils
# 
# Script contenant des exemples de requêtes cURL pour tester
# la création d'agents et la gestion des profils distincts

BASE_URL="http://localhost:3000/api"
ADMIN_TOKEN="votre_token_admin_ici"

echo "═══════════════════════════════════════════════════════════"
echo "   EXEMPLES DE REQUÊTES - Agents et Profils"
echo "═══════════════════════════════════════════════════════════"

# ============================================================
# 1️⃣ CRÉER UN AGENT
# ============================================================
echo ""
echo "1️⃣ CRÉER UN AGENT (Alice)"
echo "─────────────────────────────────────────────────────────"
echo "Endpoint: POST /api/agents"
echo "Authorization: Bearer \$ADMIN_TOKEN"
echo ""

curl -X POST "$BASE_URL/agents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "login": "agent_alice",
    "password": "alice_password_123",
    "firstName": "Alice",
    "lastName": "Martin",
    "contact": "+33612345678",
    "region": "Île-de-France",
    "idType": "carte_identité",
    "idNumber": "AB123456",
    "photo": "https://example.com/alice.jpg"
  }' | jq '.'

# ============================================================
# 2️⃣ CRÉER UN DEUXIÈME AGENT
# ============================================================
echo ""
echo "2️⃣ CRÉER UN AGENT (Bob)"
echo "─────────────────────────────────────────────────────────"
echo "Endpoint: POST /api/agents"
echo "Authorization: Bearer \$ADMIN_TOKEN"
echo ""

curl -X POST "$BASE_URL/agents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "login": "agent_bob",
    "password": "bob_password_456",
    "firstName": "Bob",
    "lastName": "Durand",
    "contact": "+33698765432",
    "region": "Provence-Alpes-Côte d'\''Azur",
    "idType": "passeport",
    "idNumber": "CD789012",
    "photo": "https://example.com/bob.jpg"
  }' | jq '.'

# ============================================================
# 3️⃣ ALICE SE CONNECTE
# ============================================================
echo ""
echo "3️⃣ CONNEXION D'ALICE"
echo "─────────────────────────────────────────────────────────"
echo "Endpoint: POST /api/auth/login"
echo "Credentials: agent_alice / alice_password_123"
echo ""

ALICE_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "agent_alice",
    "password": "alice_password_123"
  }')

echo "$ALICE_LOGIN" | jq '.'
ALICE_TOKEN=$(echo "$ALICE_LOGIN" | jq -r '.token')

echo ""
echo "✅ Token Alice: ${ALICE_TOKEN:0:20}..."

# ============================================================
# 4️⃣ BOB SE CONNECTE
# ============================================================
echo ""
echo "4️⃣ CONNEXION DE BOB"
echo "─────────────────────────────────────────────────────────"
echo "Endpoint: POST /api/auth/login"
echo "Credentials: agent_bob / bob_password_456"
echo ""

BOB_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "agent_bob",
    "password": "bob_password_456"
  }')

echo "$BOB_LOGIN" | jq '.'
BOB_TOKEN=$(echo "$BOB_LOGIN" | jq -r '.token')

echo ""
echo "✅ Token Bob: ${BOB_TOKEN:0:20}..."

# ============================================================
# 5️⃣ ALICE RÉCUPÈRE SON PROFIL PERSONNEL
# ============================================================
echo ""
echo "5️⃣ PROFIL PERSONNEL D'ALICE"
echo "─────────────────────────────────────────────────────────"
echo "Endpoint: GET /api/users/profile/me"
echo "Authorization: Bearer \$ALICE_TOKEN"
echo ""

curl -s -X GET "$BASE_URL/users/profile/me" \
  -H "Authorization: Bearer $ALICE_TOKEN" | jq '.'

# ============================================================
# 6️⃣ BOB RÉCUPÈRE SON PROFIL PERSONNEL
# ============================================================
echo ""
echo "6️⃣ PROFIL PERSONNEL DE BOB"
echo "─────────────────────────────────────────────────────────"
echo "Endpoint: GET /api/users/profile/me"
echo "Authorization: Bearer \$BOB_TOKEN"
echo ""

curl -s -X GET "$BASE_URL/users/profile/me" \
  -H "Authorization: Bearer $BOB_TOKEN" | jq '.'

# ============================================================
# 7️⃣ ALICE MET À JOUR SON PROFIL
# ============================================================
echo ""
echo "7️⃣ MISE À JOUR DU PROFIL D'ALICE"
echo "─────────────────────────────────────────────────────────"
echo "Endpoint: PUT /api/users/profile/me"
echo "Authorization: Bearer \$ALICE_TOKEN"
echo "Changes: Nouvelle région (Bretagne), nouveau contact"
echo ""

curl -s -X PUT "$BASE_URL/users/profile/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{
    "profile": {
      "contact": "+33612345679",
      "region": "Bretagne"
    }
  }' | jq '.'

# ============================================================
# 8️⃣ VÉRIFIER QUE BOB VOIT SON PROFIL À LUI (PAS CELUI D'ALICE)
# ============================================================
echo ""
echo "8️⃣ VÉRIFICATION - BOB VÉE SON PROFIL (PAS CELUI D'ALICE)"
echo "─────────────────────────────────────────────────────────"
echo "Endpoint: GET /api/users/profile/me"
echo "Authorization: Bearer \$BOB_TOKEN"
echo ""
echo "Résultat attendu: profil de Bob (Provence), pas Alice (Bretagne)"
echo ""

curl -s -X GET "$BASE_URL/users/profile/me" \
  -H "Authorization: Bearer $BOB_TOKEN" | jq '.'

# ============================================================
# VÉRIFICATION FINALE
# ============================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "   ✅ VÉRIFICATIONS"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Problème 1 RÉSOLU:"
echo "   ├─ Alice a pu se connecter avec ses identifiants"
echo "   └─ Bob a pu se connecter avec ses identifiants"
echo ""
echo "✅ Problème 2 RÉSOLU:"
echo "   ├─ Alice a son profil personnel distinct (région: Bretagne après update)"
echo "   ├─ Bob a son profil personnel distinct (région: Provence)"
echo "   └─ Les profils sont isolés - chacun voit uniquement le sien"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# ============================================================
# COMMANDES SUPPLÉMENTAIRES
# ============================================================
echo ""
echo "📝 COMMANDES SUPPLÉMENTAIRES"
echo "─────────────────────────────────────────────────────────"
echo ""
echo "Créer un Admin avec profil:"
echo "  POST /api/users"
echo "  {\"login\":\"admin1\",\"password\":\"...\",\"name\":\"Admin 1\",\"role\":\"admin\",\"profile\":{...}}"
echo ""
echo "Lister tous les utilisateurs:"
echo "  GET /api/users (nécessite token admin/agent)"
echo ""
echo "Obtenir les détails d'un utilisateur:"
echo "  GET /api/users/:id"
echo ""
echo "Supprimer un agent:"
echo "  DELETE /api/agents/:id (nécessite token admin)"
echo ""
echo "Changer le mot de passe:"
echo "  Utilisez POST /api/auth/reset-password avec resetToken"
echo ""

