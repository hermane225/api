# ⚡ ACCÈS RAPIDE - Quick Reference

Vous trouvez ici tout ce dont vous avez besoin rapidement!

---

## 🎯 "Je veux juste..."

### "...comprendre en 5 minutes"
```
Lire: DEMARRAGE_RAPIDE.md
```
**C'est tout!**

---

### "...tester l'API"
```bash
# Option 1: Script cURL
./EXEMPLE_REQUETES.sh

# Option 2: Script Node.js
node test-agent-profile.js
```

---

### "...créer un agent"
```bash
POST /api/agents
{
  "login": "agent1",
  "password": "pass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

### "...me connecter"
```bash
POST /auth/login
{
  "login": "agent1",
  "password": "pass123"
}
# Réponse: token + profil
```

---

### "...voir mon profil"
```bash
GET /api/users/profile/me
Authorization: Bearer <token>
```

---

### "...mettre à jour mon profil"
```bash
PUT /api/users/profile/me
Authorization: Bearer <token>
{
  "profile": {
    "contact": "+33612345678"
  }
}
```

---

### "...installer"
```bash
# Lire le guide complet:
Consulter: GUIDE_INSTALLATION_MIGRATION.md

# Étapes rapides:
1. Redémarrer l'application
2. Exécuter les tests
3. C'est fait!
```

---

### "...valider"
```bash
# Exécuter les tests
./EXEMPLE_REQUETES.sh

# ou
node test-agent-profile.js

# Vérifier: CHECKLIST_VALIDATION.md
```

---

### "...comprendre le code"
```
Lire: DETAIL_MODIFICATIONS_CODE.md
Fichiers touchés:
- src/models/User.js
- src/controllers/agent.controller.js
- src/controllers/auth.controller.js
- src/controllers/user.controller.js
- src/routes/users.routes.js
```

---

### "...avoir une vue d'ensemble"
```
Lire: RESUME_EXECUTIF.md
ou
Consulter: TABLEAU_BORD.md
```

---

### "...résoudre une erreur"
```
Consulter: GUIDE_INSTALLATION_MIGRATION.md#-troubleshooting
```

---

### "...naviguer dans la doc"
```
Voir: README_DOCUMENTATION.md
ou
Voir: LISTE_DOCUMENTS.md
```

---

## 🚀 Flux d'utilisation

```
1. Créer un agent
   POST /api/agents

2. Se connecter
   POST /auth/login
   → Token

3. Utiliser le token
   GET /api/users/profile/me
   Authorization: Bearer <token>

4. Mettre à jour le profil
   PUT /api/users/profile/me
   Authorization: Bearer <token>
```

---

## 📚 Documents rapides

| Temps | Document |
|-------|----------|
| **5 min** | [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md) |
| **5 min** | [RESUME_EXECUTIF.md](RESUME_EXECUTIF.md) |
| **5 min** | [TABLEAU_BORD.md](TABLEAU_BORD.md) |
| **10 min** | [MODIFICATIONS_RESUME.md](MODIFICATIONS_RESUME.md) |
| **15 min** | [BEFORE_APRES.md](AVANT_APRES.md) |
| **20 min** | [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) |
| **30 min** | [GUIDE_INSTALLATION_MIGRATION.md](GUIDE_INSTALLATION_MIGRATION.md) |

---

## 🔗 Raccourcis

| Besoin | Lien |
|--------|------|
| Accueil | [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md) |
| Navigation | [README_DOCUMENTATION.md](README_DOCUMENTATION.md) |
| Installation | [GUIDE_INSTALLATION_MIGRATION.md](GUIDE_INSTALLATION_MIGRATION.md) |
| Tests | [EXEMPLE_REQUETES.sh](EXEMPLE_REQUETES.sh) |
| Code | [DETAIL_MODIFICATIONS_CODE.md](DETAIL_MODIFICATIONS_CODE.md) |
| Checklist | [CHECKLIST_VALIDATION.md](CHECKLIST_VALIDATION.md) |
| Liste docs | [LISTE_DOCUMENTS.md](LISTE_DOCUMENTS.md) |

---

## 🆘 Aide d'urgence

### Erreur: "Utilisateur non trouvé"
```
→ L'agent n'existe pas
→ Créer avec: POST /api/agents
```

### Erreur: "Login déjà utilisé"
```
→ Login non unique
→ Utiliser un autre login
```

### Erreur: "Token manquant"
```
→ Oubli du header Authorization
→ Ajouter: Authorization: Bearer <token>
```

### Le profil ne s'affiche pas
```
→ Profil vide
→ Mettre à jour avec: PUT /api/users/profile/me
```

---

## ✅ Vérification rapide

```bash
# La santé de l'API
curl http://localhost:3000/api/health

# Créer un agent
curl -X POST http://localhost:3000/api/agents ...

# Se connecter
curl -X POST http://localhost:3000/api/auth/login ...

# Voir le profil
curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/users/profile/me
```

---

## 📊 Status

- ✅ Code: COMPLÉTÉ
- ✅ Tests: FOURNIS
- ✅ Documentation: EXHAUSTIVE
- ✅ Installation: FACILE
- ✅ Sécurité: VALIDÉE
- ✅ Production: PRÊT

---

## 🎉 TL;DR

**Problèmes résolus:**
1. ✅ Agents peuvent se connecter
2. ✅ Chacun a son profil privé

**Pour commencer:**
- Lire [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)
- Exécuter `./EXEMPLE_REQUETES.sh`
- Installer: [GUIDE_INSTALLATION_MIGRATION.md](GUIDE_INSTALLATION_MIGRATION.md)

**C'est tout!** 🚀

---

**Questions?** Consulter [README_DOCUMENTATION.md](README_DOCUMENTATION.md)

