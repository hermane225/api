# Structure finale du projet

## Fichiers modifiés/créés

```
village-connecte-api/
├── src/
│   ├── utils/
│   │   └── borneMonitor.js              [CRÉÉ] Classe modulaire de monitoring
│   ├── app.js                           [MODIFIÉ] Intégration des endpoints de monitoring
│   └── ... (autres fichiers inchangés)
│
├── scripts/
│   └── monitor-standalone.js            [CRÉÉ] Script autonome de monitoring
│
├── test/
│   └── test.js                          [ORIGINAL] Ancien script (compatibilité)
│
├── docs/
│   └── MONITORING.md                    [CRÉÉ] Documentation complète
│
├── server.js                            [MODIFIÉ] Intégration avec auto-start optionnel
├── package.json                         [MODIFIÉ] Ajout dépendances + scripts
├── .env                                 [MODIFIÉ] Ajout variables monitoring
└── .env.example                         [CRÉÉ] Template de configuration
```

## Classe BorneMonitor

Méthodes principales :
- `constructor(config)` - Initialiser avec configuration optionnelle
- `authenticate()` - S'authentifier auprès de l'API
- `start()` - Démarrer le monitoring
- `stop()` - Arrêter le monitoring
- `getStatus()` - Obtenir l'état actuel

Caractéristiques :
- ✅ Configuration par variables d'environnement
- ✅ Gestion des erreurs robuste
- ✅ Support de SNMP pour les statistiques réseau
- ✅ Détection automatique du routeur
- ✅ Vérification de la connexion Internet
- ✅ Synchronisation avec l'API via REST

## Modes de lancement

1. **Serveur seul** : `npm start` ou `npm run dev`
2. **Serveur + monitoring auto** : `npm run monitor:start`
3. **Script autonome** : `node scripts/monitor-standalone.js`
4. **Via API** : POST `/api/monitoring/start`

## Variables d'environnement

Variables obligatoires (pour monitoring) :
- `API_BASE` - URL de l'API
- `API_LOGIN` - Identifiant
- `API_PASSWORD` - Mot de passe

Variables optionnelles :
- `API_TOKEN` - Token JWT (sinon génération automatique)
- `SNMP_COMMUNITY` - Communauté SNMP (défaut: "public")
- `IF_INDEX` - Index interface SNMP (défaut: 1)
- `MONITORING_INTERVAL` - Intervalle monitoring (défaut: 5000ms)
- `PING_TIMEOUT` - Timeout ping (défaut: 2s)
- `AUTO_START_MONITORING` - Auto-démarrage (défaut: false)

## Endpoints REST

```
POST /api/monitoring/start      - Démarrer le monitoring
POST /api/monitoring/stop       - Arrêter le monitoring
GET  /api/monitoring/status     - Obtenir le statut
GET  /api/health               - Vérifier l'API
```

## Dépendances ajoutées

- `axios@^1.6.5` - Requêtes HTTP
- `ping@^0.4.4` - Tests de ping
- `net-snmp@^3.11.0` - Requêtes SNMP

## Prochaines étapes recommandées

1. Installer les dépendances : `npm install`
2. Configurer le token API_TOKEN dans `.env`
3. Tester : `node scripts/monitor-standalone.js`
4. Vérifier les logs d'authentification et de détection de borne
