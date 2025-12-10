# Structure détaillée de l'API — Village Connecté

## Arborescence recommandée
- src/
  - config/
    - db.js
  - controllers/
    - authController.js
    - userController.js
    - codeController.js
    - forfaitController.js
    - agentController.js
  - middleware/
    - auth.js            -> authenticate, authorize
    - errorHandler.js
    - validate.js
  - models/
    - user.js
    - code.js
    - forfait.js
    - agent.js
  - routes/
    - authRoutes.js
    - userRoutes.js
    - codeRoutes.js
    - forfaitRoutes.js
    - agentRoutes.js
  - services/
    - codeGenerator.js   -> génération unique, retry en cas de collision
  - views/               -> pages statiques (ex: generateCodes.html)
  - app.js
- server.js
- .env
- package.json
- docs/
  - api-structure.md
  - api-structure.md+1

---

## Modèles (résumé)
- User
  - name: String, required
  - email: String, required, unique
  - password: String, required (hashé)
  - role: String enum ['agent','admin','user'], default 'agent'

- Forfait
  - name: String, required
  - description: String
  - category: String
  - durationValue: Number
  - price: Number

- Code
  - code: String, unique, généré automatiquement
  - forfait: ObjectId -> Forfait
  - category: String
  - durationValue: Number
  - price: Number
  - generatedBy: ObjectId -> User/Agent
  - used: Boolean, default false
  - usedBy: String | ObjectId

---

## Routes principales (par ressource)

Auth (/api/auth)
- POST /register
  - body: { name, email, password, role? }
  - resp: { user, token }
- POST /login
  - body: { email, password }
  - resp: { user, token }
- GET /me (auth)
- PUT /me (auth)
- POST /change-password (auth)

Users (/api/users)
- GET / (admin)
- GET /:id (admin)
- PUT /:id (admin)
- DELETE /:id (admin)

Forfaits (/api/forfaits)
- GET /             -> lister
- POST / (admin)    -> créer
- GET /:id
- PUT /:id (admin)
- DELETE /:id (admin)

Codes (/api/codes)
- POST /generate (agent/admin)
  - body: { forfaitId, quantity, category }
  - limite serveur: max quantity (ex: 100)
- GET /all (auth)
- GET /:id (auth)
- POST /redeem
  - body: { code } -> vérifier unused, marquer used et associer usedBy

Agents (/api/agents)
- CRUD agents si distincts des Users

---

## Middlewares indispensables
- authenticate: vérifier JWT, set req.user = { id, role }
- authorize(role): restreindre aux rôles
- errorHandler: envelopper erreurs et renvoyer JSON unifié
- validate: valider payload (express-validator / Joi)

---

## Service de génération de codes (src/services/codeGenerator.js)
- generateUniqueCode()
  - génère un code (préfixe + horodatage + base36 aléatoire)
  - vérifie unicité en DB (retry N fois)
  - retourne code unique ou erreur après N essais
- Limiter quantity côté serveur et utiliser insertMany avec batch si besoin

---

## Exemples d'utilisation

1) Générer 10 codes (POST /api/codes/generate, auth)
Request:
{
  "forfaitId": "640...abc",
  "quantity": 10,
  "category": "Hebdomadaire"
}
Response 201:
{
  "message": "10 code(s) générés avec succès",
  "codes": [
    { "_id":"...", "code":"CODE-...","forfait":"...","category":"Hebdomadaire","durationValue":7,"price":500,"generatedBy":"agentId" },
    ...
  ]
}

2) Récupérer tous les codes (GET /api/codes/all, auth)
Response 200: [ { code, category, forfait: { name }, durationValue, price, generatedBy: { name } }, ... ]

---

## Bonnes pratiques & notes
- Protéger JWT_SECRET, ne pas committer .env
- Encoder les caractères spéciaux dans MONGO_URI ou utiliser variables séparées (user/password)
- Limiter la taille des batchs pour la génération
- Logger et surveiller erreurs (morgan/winston)
- Tests unitaires pour codeGenerator (collision), controllers et middlewares
- Utiliser transactions pour opérations multi-documents critiques
