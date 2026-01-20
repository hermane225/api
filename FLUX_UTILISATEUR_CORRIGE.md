# Flux Utilisateur Corrigé - Achat de Forfaits et Génération de Codes

## Résumé des Modifications

Le flux a été amélioré pour permettre aux utilisateurs de suivre ce processus :
1. **Voir les forfaits disponibles**
2. **Choisir et acheter un forfait** (créer une transaction)
3. **Recevoir automatiquement un code généré** après paiement

---

## Modifications Effectuées

### 1. Modèle Code (`src/models/code.js`)
**Nouveaux champs ajoutés :**
- `purchasedBy`: Référence à l'utilisateur qui a acheté le code
- `transaction`: Référence à la transaction associée
- `usedBy`: Modifié pour être une référence à un User (au lieu de string)
- `generatedBy`: Modifié pour accepter des User (au lieu uniquement Agent)

### 2. Contrôleur Transactions (`src/controllers/transaction.controller.js`)
**Changements :**
- Les **utilisateurs** peuvent maintenant créer leurs propres transactions
- Tous les rôles authentifiés (`user`, `agent`, `admin`) peuvent créer des transactions
- Les utilisateurs voient leurs transactions dans `listTransactions`

### 3. Contrôleur Forfaits (`src/controllers/forfait.controller.js`)
**Changements :**
- Les **utilisateurs** et **agents** peuvent voir TOUS les forfaits disponibles
- Permet aux utilisateurs de choisir parmi les forfaits avant d'acheter
- Les admins ne voient que leurs propres forfaits

### 4. Contrôleur Codes (`src/controllers/code.controller.js`)
**Nouveaux endpoints pour utilisateurs :**

#### a) `POST /codes/purchase` - Acheter un forfait et générer un code
```javascript
Flux:
1. Utilisateur envoie {forfaitId: "xxx"}
2. Système crée une transaction
3. Système génère automatiquement un code
4. Code est marqué comme PAYÉ et ACTIF
5. Code est assigné à l'utilisateur (purchasedBy)
```

#### b) `POST /codes/redeem` - Redémer un code (optionnel)
```javascript
Flux:
1. Utilisateur envoie le code reçu {codeStr: "ABC123..."}
2. Si le code existe et n'est pas utilisé
3. Code est assigné à l'utilisateur
4. Code est marqué comme actif et payé
```

**Modifications existantes :**
- `listCodes`: Les utilisateurs peuvent voir leurs codes achetés
- Ajout de population pour les relations (`generatedBy`, `purchasedBy`, `forfait`)

### 5. Routes Codes (`src/routes/codes.routes.js`)
**Nouvelles routes :**
```
POST   /codes/purchase      - Acheter un forfait (utilisateurs et agents)
POST   /codes/redeem        - Redémer un code (tous les utilisateurs)
PUT    /codes/:id/activate  - Activer un code (admins/agents/super_admin)
GET    /codes/check/:codeStr - Vérifier le statut d'un code (public)
```

---

## Flux Complet Utilisateur

### Scenario: Un utilisateur achète un forfait internet

```
1. Utilisateur s'authentifie
   └─ GET /auth/login -> reçoit token JWT

2. Utilisateur voit les forfaits disponibles
   └─ GET /forfaits
      └─ Réponse: [
           { id: "1", name: "Forfait 1GB", price: 5000, durationValue: 30 },
           { id: "2", name: "Forfait 5GB", price: 20000, durationValue: 90 }
         ]

3. Utilisateur choisit le forfait 1GB et achète
   └─ POST /codes/purchase
      └─ Body: { forfaitId: "1" }
      └─ Réponse: {
           transaction: { id: "txn-123", amount: 5000, ... },
           code: { 
             id: "code-456",
             code: "ABC123XYZ789",
             status: "active",
             paid: true,
             purchasedBy: "user-id",
             paidAt: "2026-01-20T10:30:00Z"
           }
         }

4. Utilisateur reçoit le code généré automatiquement
   └─ Code peut être immédiatement utilisé
   └─ Code est visible dans: GET /codes

5. (Optionnel) Utilisateur peut redémer un code externe
   └─ POST /codes/redeem
      └─ Body: { codeStr: "ABC123XYZ789" }
```

---

## Permissions par Rôle

| Endpoint | Super Admin | Admin | Agent | User |
|----------|-----------|-------|-------|------|
| GET /forfaits | ✅ tous | ✅ siens | ✅ tous | ✅ tous |
| POST /codes/purchase | ✅ | ✅ | ✅ | ✅ |
| GET /codes | ✅ tous | ✅ générés | ✅ générés | ✅ achetés |
| POST /codes/redeem | ✅ | ✅ | ✅ | ✅ |
| POST /codes/generate | ✅ | ✅ | ✅ | ❌ |
| PUT /codes/:id/activate | ✅ | ✅ | ✅ | ❌ |

---

## Tests Recommandés

```bash
# 1. Utilisateur se connecte
POST /auth/login
Body: { login: "user1", password: "pass123" }

# 2. Utilisateur voit les forfaits
GET /forfaits
Headers: { Authorization: "Bearer TOKEN" }

# 3. Utilisateur achète un forfait
POST /codes/purchase
Headers: { Authorization: "Bearer TOKEN" }
Body: { forfaitId: "ID_DU_FORFAIT" }

# 4. Utilisateur voit ses codes achetés
GET /codes
Headers: { Authorization: "Bearer TOKEN" }

# 5. Utilisateur vérifie le statut de son code
GET /codes/check/ABC123XYZ789
```

---

## Notes Importantes

1. **Code généré automatiquement** : Après un achat, l'utilisateur reçoit immédiatement un code actif
2. **Traçabilité** : Chaque code enregistre qui l'a acheté (`purchasedBy`) et la transaction associée
3. **Statut du code** :
   - `inactive` → avant paiement (codes générés par admins/agents)
   - `active` → après paiement (codes achetés par utilisateurs)
4. **Utilisateur ne peut pas créer ses codes** : Seuls les admins/agents génèrent les codes

---

Créé le: 20 janvier 2026
