# 🔄 GUIDE DE MIGRATION ET INSTALLATION

## 📋 Conditions requises

- ✅ Node.js 14+
- ✅ MongoDB 4.0+
- ✅ npm ou yarn
- ✅ bcryptjs (déjà dans package.json)
- ✅ jsonwebtoken (déjà dans package.json)

---

## 🚀 Étapes d'installation

### Étape 1: Sauvegarder les données existantes (optionnel)

Si vous avez déjà des données en production:
```bash
# Exporter les données Agent existantes
mongodump --db <votre_db> --collection Agent --out ./backup/

# Sauvegarder les données User existantes
mongodump --db <votre_db> --collection User --out ./backup/
```

### Étape 2: Appliquer les modifications du code

Les fichiers ont déjà été modifiés:
- ✅ `src/models/User.js` - Modèle amélioré
- ✅ `src/controllers/agent.controller.js` - Agent creation fix
- ✅ `src/controllers/auth.controller.js` - Auth improved
- ✅ `src/controllers/user.controller.js` - Profile endpoints
- ✅ `src/routes/users.routes.js` - New routes

**Aucune action requise** - Les fichiers sont déjà à jour!

### Étape 3: Redémarrer l'application

```bash
# Arrêter l'application
# Ctrl+C dans le terminal

# Redémarrer
npm start
# ou
node src/app.js
```

### Étape 4: Vérifier la connexion

```bash
# Tester la santé de l'API
curl http://localhost:3000/api/health
# Devrait retourner: {"ok":true,"env":"dev"}
```

---

## 🔄 Migration des données existantes (Optionnel)

### Situation 1: Vous avez des agents sans authentification

**Si vous avez des agents dans la collection Agent:**

```javascript
// Script de migration (à exécuter une fois)
import Agent from "./src/models/Agent.js";
import User from "./src/models/User.js";
import bcrypt from "bcryptjs";

async function migrateAgents() {
  try {
    // Récupérer tous les agents
    const agents = await Agent.find();
    
    for (const agent of agents) {
      // Vérifier si un User existe déjà
      const existingUser = await User.findOne({ login: agent.login });
      
      if (!existingUser && agent.login && agent.password) {
        // Créer un User correspondant
        await User.create({
          login: agent.login,
          password: agent.password, // Déjà hashé dans Agent
          name: `${agent.firstName} ${agent.lastName}`,
          role: "agent",
          profile: {
            photo: agent.photo || "",
            lastName: agent.lastName || "",
            firstName: agent.firstName || "",
            contact: agent.contact || "",
            idType: agent.idType || "",
            idNumber: agent.idNumber || "",
            region: agent.region || "",
          }
        });
        
        console.log(`✅ Migrated agent: ${agent.login}`);
      }
    }
    
    console.log(`✅ Migration complète!`);
  } catch (error) {
    console.error("❌ Erreur migration:", error);
  }
}

// Exécuter: migrateAgents();
```

### Situation 2: Vous avez des admins sans profil

**Les admins existants peuvent utiliser les nouveaux endpoints:**

```javascript
// Les admins existants auront un profil vide
// Ils peuvent le remplir avec:
PUT /api/users/profile/me
{
  "name": "Admin Name",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "contact": "+33612345678",
    "region": "Île-de-France"
  }
}
```

---

## ✅ Vérification post-installation

### Vérification 1: Modèle User

```bash
# Connectez-vous à MongoDB
mongosh

# Vérifier la structure
use <votre_db>
db.users.findOne()

# Devrait montrer la structure:
{
  _id: ObjectId(...),
  login: "...",
  password: "...",
  name: "...",
  role: "...",
  group: null,
  profile: {  // ✅ CE CHAMP DOIT EXISTER
    firstName: "...",
    lastName: "...",
    contact: "...",
    region: "...",
    ...
  }
}
```

### Vérification 2: Créer un agent de test

```bash
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "login": "test_agent",
    "password": "test123",
    "firstName": "Test",
    "lastName": "Agent",
    "region": "Test Region"
  }'

# Réponse attendue:
{
  "message": "✅ Agent créé avec succès",
  "user": {
    "id": "...",
    "login": "test_agent",
    "role": "agent",
    "profile": {...}
  }
}
```

### Vérification 3: L'agent peut se connecter

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "test_agent",
    "password": "test123"
  }'

# Réponse attendue:
{
  "message": "Connexion réussie",
  "user": {
    "id": "...",
    "login": "test_agent",
    "role": "agent",
    "profile": {...}
  },
  "token": "eyJhbGc..."
}
```

### Vérification 4: L'agent peut accéder à son profil

```bash
# Sauvegarder le token de la réponse précédente
TOKEN="eyJhbGc..."

curl -X GET http://localhost:3000/api/users/profile/me \
  -H "Authorization: Bearer $TOKEN"

# Réponse attendue:
{
  "id": "...",
  "login": "test_agent",
  "role": "agent",
  "profile": {
    "firstName": "Test",
    "lastName": "Agent",
    "region": "Test Region",
    ...
  }
}
```

### Vérification 5: L'agent peut mettre à jour son profil

```bash
curl -X PUT http://localhost:3000/api/users/profile/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "profile": {
      "contact": "+33612345678"
    }
  }'

# Réponse attendue:
{
  "message": "✅ Profil mis à jour avec succès",
  "user": {
    "profile": {
      "contact": "+33612345678",
      ...
    }
  }
}
```

---

## 🆘 Troubleshooting

### Problème: "Token manquant" lors du test du profil

**Cause:** Le token n'est pas passé correctement

**Solution:**
```bash
# ✅ BON - Utiliser Bearer <token>
curl -H "Authorization: Bearer eyJhbGc..."

# ❌ MAUVAIS - Oublier "Bearer"
curl -H "Authorization: eyJhbGc..."

# ❌ MAUVAIS - Oublier le header entièrement
curl ...
```

### Problème: "Login déjà utilisé" lors de la création d'agent

**Cause:** Un utilisateur avec ce login existe déjà

**Solution:**
```bash
# Vérifier que le login est unique
db.users.findOne({login: "votre_login"})

# Si nécessaire, utiliser un autre login
POST /api/agents avec login différent
```

### Problème: "Utilisateur introuvable" lors de la connexion

**Cause:** L'agent n'a pas été créé avec succès dans User

**Solution:**
```bash
# Vérifier que l'agent est dans User
db.users.findOne({login: "agent_login"})

# Si absent, le recréer avec POST /api/agents
```

### Problème: Le profil n'affiche rien

**Cause:** Le champ profile est vide

**Solution:**
```bash
# Mettre à jour le profil
PUT /api/users/profile/me
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "contact": "+33...",
    "region": "..."
  }
}
```

### Problème: Erreur "Modèle User change"

**Cause:** MongoDB n'a pas synchronisé le schéma

**Solution:**
```bash
# Option 1: Redémarrer l'application
# Ctrl+C puis npm start

# Option 2: Nettoyer la collection (données perdues!)
db.users.deleteMany({})

# Option 3: Vérifier les connexions MongoDB
# S'assurer que MongoDB est en cours d'exécution
```

---

## 📊 Vérification de l'intégrité

### Script de vérification

```bash
# Exécuter le script de test
node test-agent-profile.js

# Vous devriez voir:
✅ Agent 1 créé
✅ Agent 2 créé
✅ Agent 1 connecté
✅ Agent 2 connecté
✅ Profil Agent 1 récupéré
✅ Profil Agent 2 récupéré
✅ Profil Agent 1 distinct confirmé
✅ Profil Agent 2 distinct confirmé
✅ Profils bien isolés
```

---

## 🔄 Rollback (si nécessaire)

Si vous devez annuler les changements:

### Étape 1: Restaurer le code

```bash
# Si vous avez git:
git checkout src/models/User.js
git checkout src/controllers/agent.controller.js
git checkout src/controllers/auth.controller.js
git checkout src/controllers/user.controller.js
git checkout src/routes/users.routes.js
```

### Étape 2: Restaurer les données

```bash
# Restaurer les données sauvegardées
mongorestore --db <votre_db> ./backup/
```

### Étape 3: Redémarrer l'application

```bash
npm start
```

---

## 📝 Notes importantes

1. **Les données existantes restent intactes** - Migration non-destructive
2. **Rétrocompatibilité assurée** - Collection Agent toujours créée
3. **Aucun dowtime requis** - Changements appliqués lors du redémarrage
4. **Backup recommandé** - Toujours sauvegarder avant les changements majeurs
5. **Tests fournis** - Utiliser test-agent-profile.js pour vérifier

---

## ✅ Checklist post-installation

- [ ] Code mise à jour (fichiers modifiés)
- [ ] Application redémarrée
- [ ] MongoDB accessible et en cours d'exécution
- [ ] Endpoint /health accessible
- [ ] Agent créé avec succès
- [ ] Agent connecté avec succès
- [ ] Profil de l'agent accessible
- [ ] Profil de l'agent peut être mis à jour
- [ ] Deux agents ont des profils distincts
- [ ] Test-agent-profile.js passe avec succès

---

## 📞 Support

**Questions sur l'installation?**
- Consulter IMPLEMENTATION_GUIDE.md
- Consulter EXEMPLE_REQUETES.sh pour les requêtes HTTP

**Problème technique?**
- Vérifier les logs: `npm start` (regarder la sortie)
- Vérifier MongoDB: `mongosh` → `db.adminCommand({ping: 1})`
- Tester l'API: `curl http://localhost:3000/api/health`

---

## 🎉 Prochaines étapes

Une fois la migration complète:

1. ✅ Former les admins sur la création d'agents
2. ✅ Former les agents sur la connexion et le profil
3. ✅ Mettre en place un monitoring
4. ✅ Documenter les changements pour l'équipe
5. ✅ Planifier les futures améliorations

