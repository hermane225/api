# Guide d'implémentation - Corrections apportées

## 📋 Résumé des modifications

Ce document détaille les corrections apportées pour résoudre les deux problèmes identifiés:

1. **Les agents créés par un admin peuvent maintenant se connecter** avec leurs identifiants (login/password)
2. **Chaque admin et chaque agent a son profil privé distinct** - Admin 1 a un profil différent d'Admin 2, Agent 1 a un profil différent d'Agent 2, etc.

---

## 🔧 Modifications effectuées

### 1. Modèle User amélioré (`src/models/User.js`)

**Ajout:** Champ `profile` contenant les informations personnelles de chaque utilisateur.

```javascript
profile: {
  photo: { type: String },
  lastName: { type: String },
  firstName: { type: String },
  contact: { type: String },
  idType: { type: String },
  idNumber: { type: String },
  region: { type: String },
}
```

**Avantage:** Chaque utilisateur (admin, agent, user) a maintenant son propre profil distinct et privé.

---

### 2. Contrôleur Agent modifié (`src/controllers/agent.controller.js`)

**Changement principal:** La fonction `createAgent()` crée maintenant un utilisateur dans la collection `User` avec le rôle `"agent"`.

**Avant:**
- Les agents n'existaient que dans la collection `Agent`
- Pas de possibilité de se connecter via `/auth/login`

**Après:**
- Création automatique d'un compte `User` avec rôle `"agent"`
- Le mot de passe est hashé avec bcrypt
- L'agent peut se connecter avec ses identifiants
- Rétrocompatibilité: L'entrée `Agent` est aussi créée

```javascript
export const createAgent = async (req, res, next) => {
  const { login, password, firstName, lastName, contact, idType, idNumber, region } = req.body;
  
  // Crée d'abord un User avec rôle "agent"
  const user = await User.create({
    login,
    password: hashed,
    name: `${firstName} ${lastName}`,
    role: "agent",
    profile: {
      photo: req.body.photo || "",
      lastName: lastName || "",
      firstName: firstName || "",
      contact: contact || "",
      idType: idType || "",
      idNumber: idNumber || "",
      region: region || "",
    }
  });
  
  // Crée aussi dans Agent pour rétrocompatibilité
  const agent = await Agent.create({ ...req.body, password: hashed });
};
```

---

### 3. Contrôleur Auth amélioré (`src/controllers/auth.controller.js`)

**Changements:**
- La réponse `login()` inclut maintenant le profil de l'utilisateur
- La réponse `register()` inclut le profil

```javascript
res.json({
  message: "Connexion réussie",
  user: { 
    id: user._id, 
    login: user.login, 
    role: user.role,
    name: user.name,
    profile: user.profile || {}  // ✅ Profil inclus
  },
  token,
});
```

---

### 4. Contrôleur User - Nouveaux endpoints (`src/controllers/user.controller.js`)

**Ajout:** Deux nouvelles fonctions pour gérer le profil personnel:

#### `getMyProfile()` - Récupère le profil de l'utilisateur connecté
```javascript
GET /api/users/profile/me
Headers: Authorization: Bearer <token>

Response:
{
  "id": "...",
  "login": "admin1",
  "name": "Administrator 1",
  "role": "admin",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "contact": "+33612345678",
    "region": "Île-de-France",
    ...
  }
}
```

#### `updateMyProfile()` - Met à jour le profil personnel
```javascript
PUT /api/users/profile/me
Headers: Authorization: Bearer <token>

Body:
{
  "name": "John Doe",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "contact": "+33612345678",
    "photo": "url_de_la_photo",
    "idType": "passport",
    "idNumber": "ABC123456",
    "region": "Île-de-France"
  }
}

Response:
{
  "message": "✅ Profil mis à jour avec succès",
  "user": { ... }
}
```

---

### 5. Routes Users améliorisées (`src/routes/users.routes.js`)

**Ajout:** Deux nouvelles routes pour le profil personnel

```javascript
// Récupération et mise à jour du profil personnel
router.get("/profile/me", verifyToken, getMyProfile);
router.put("/profile/me", verifyToken, updateMyProfile);
```

⚠️ **Important:** Ces routes sont protégées par `verifyToken` - seul un utilisateur connecté peut y accéder.

---

## 🚀 Mode d'utilisation

### Étape 1: Créer un agent
```bash
POST /api/agents
Headers: 
  Authorization: Bearer <admin_token>
  Content-Type: application/json

Body:
{
  "login": "agent_pierre",
  "password": "motdepasse123",
  "firstName": "Pierre",
  "lastName": "Dupont",
  "contact": "+33612345678",
  "region": "Normandie",
  "idType": "carte_identite",
  "idNumber": "123456789"
}

Response:
{
  "message": "✅ Agent créé avec succès",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "login": "agent_pierre",
    "role": "agent",
    "name": "Pierre Dupont",
    "profile": {
      "firstName": "Pierre",
      "lastName": "Dupont",
      "contact": "+33612345678",
      ...
    }
  }
}
```

### Étape 2: L'agent se connecte
```bash
POST /api/auth/login
Headers: Content-Type: application/json

Body:
{
  "login": "agent_pierre",
  "password": "motdepasse123"
}

Response:
{
  "message": "Connexion réussie",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "login": "agent_pierre",
    "role": "agent",
    "name": "Pierre Dupont",
    "profile": { ... }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Étape 3: L'agent consulte son profil
```bash
GET /api/users/profile/me
Headers: Authorization: Bearer <token>

Response:
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "login": "agent_pierre",
  "name": "Pierre Dupont",
  "role": "agent",
  "profile": {
    "firstName": "Pierre",
    "lastName": "Dupont",
    "contact": "+33612345678",
    "region": "Normandie",
    "idType": "carte_identite",
    "idNumber": "123456789"
  }
}
```

### Étape 4: L'agent met à jour son profil (optionnel)
```bash
PUT /api/users/profile/me
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "profile": {
    "contact": "+33698765432",  // Nouveau numéro
    "region": "Bretagne"         // Nouveau région
  }
}
```

---

## 👥 Exemple avec plusieurs agents

**Créer Agent 1:**
```bash
POST /api/agents
{
  "login": "agent1",
  "password": "pass123",
  "firstName": "Alice",
  "lastName": "Martin",
  "region": "Île-de-France"
}
```

**Créer Agent 2:**
```bash
POST /api/agents
{
  "login": "agent2",
  "password": "pass456",
  "firstName": "Bob",
  "lastName": "Durand",
  "region": "Provence"
}
```

Résultat: Agent 1 a son profil distinct (Alice Martin, Île-de-France) et Agent 2 a un profil différent (Bob Durand, Provence). Chacun peut se connecter avec ses propres identifiants et voir/modifier uniquement son profil.

---

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ JWT pour l'authentification
- ✅ Middleware `verifyToken` protège les endpoints sensibles
- ✅ Profils isolés: Chaque utilisateur ne peut voir/modifier que son profil (`/profile/me`)
- ✅ Pas de super admin: Utilisation des rôles existants (admin, agent, user)

---

## 📝 Résumé des changements de code

| Fichier | Modification |
|---------|------------|
| `User.js` | Ajout du champ `profile` |
| `agent.controller.js` | `createAgent()` crée maintenant un `User` |
| `auth.controller.js` | Réponses incluent le profil |
| `user.controller.js` | Ajout de `getMyProfile()` et `updateMyProfile()` |
| `users.routes.js` | Ajout des routes `/profile/me` |

---

## ✅ Vérification

Pour s'assurer que tout fonctionne:

1. ✅ Un admin peut créer un agent avec login/password
2. ✅ L'agent créé peut se connecter via `/auth/login`
3. ✅ Chaque agent a son propre profil distinct
4. ✅ Chaque admin a son propre profil distinct
5. ✅ Les utilisateurs ne peuvent accéder qu'à leur profil personnel

---

## 🔄 Rétrocompatibilité

- Les anciens agents dans la collection `Agent` ne sont pas affectés
- La création d'agent crée maintenant dans BOTH collections pour une transition en douceur
- Les endpoints existants continuent de fonctionner

