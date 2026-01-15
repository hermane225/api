# Monitoring des Bornes - Documentation

## Architecture

Le système de monitoring a été refactorisé en une classe modulaire `BorneMonitor` pour une meilleure réutilisabilité et testabilité.

### Structure

```
src/
├── utils/
│   └── borneMonitor.js      # Classe principale de monitoring
├── app.js                   # Intégration Express
server.js                     # Point d'entrée avec auto-start optionnel
scripts/
└── monitor-standalone.js    # Script autonome
test/
└── test.js                  # Tests (ancienne version)
```

## Installation

1. **Installer les dépendances** :
```bash
npm install
```

2. **Configurer les variables d'environnement** :
```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

## Utilisation

### Option 1 : Intégré au serveur Express (Recommandé)

**Démarrer le serveur SANS monitoring** :
```bash
npm start
# ou
npm run dev
```

**Démarrer avec monitoring automatique** :
```bash
npm run monitor:start
```

### Option 2 : Script autonome

```bash
node scripts/monitor-standalone.js
```

### Option 3 : API REST

**Démarrer le monitoring** :
```bash
POST /api/monitoring/start
```

**Arrêter le monitoring** :
```bash
POST /api/monitoring/stop
```

**Vérifier le statut** :
```bash
GET /api/monitoring/status

Réponse :
{
  "isRunning": true,
  "borneId": "...",
  "detectedBorne": {
    "name": "SSID",
    "ip": "192.168.1.1"
  },
  "lastStatus": "EN_SERVICE"
}
```

## Configuration

Variables d'environnement disponibles :

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `API_BASE` | https://api.villageconnecte.voisilab.online | URL de l'API |
| `API_TOKEN` | (vide) | Token JWT pour authentification |
| `API_LOGIN` | hermane | Identifiant pour authentification |
| `API_PASSWORD` | hermane2005 | Mot de passe |
| `SNMP_COMMUNITY` | public | Communauté SNMP |
| `IF_INDEX` | 1 | Index de l'interface réseau à monitorer |
| `MONITORING_INTERVAL` | 5000 | Intervalle de monitoring (ms) |
| `PING_TIMEOUT` | 2 | Timeout du ping (s) |
| `AUTO_START_MONITORING` | false | Démarrer automatiquement au lancement du serveur |

## États de la borne

- **EN_SERVICE** ✅ : Borne en ligne avec Internet
- **INSTABLE** ⚠️ : Borne en ligne mais sans Internet
- **HORS_LIGNE** ❌ : Borne ne répond pas

## Sécurité

⚠️ **Important** :
- Ne pas commiter `.env` avec les credentials réels
- Utiliser un `.env.example` pour les variables sans données sensibles
- Stocker les tokens JWT de manière sécurisée
- Considérer l'utilisation de secrets management (AWS Secrets, Vault, etc.)

## Exemple d'utilisation en code

```javascript
import BorneMonitor from './src/utils/borneMonitor.js';

const monitor = new BorneMonitor({
  apiBase: 'https://api.villageconnecte.voisilab.online',
  credentials: {
    login: 'hermane',
    password: 'hermane2005'
  },
  monitoringInterval: 5000
});

// Démarrer
await monitor.start();

// Vérifier le statut
const status = monitor.getStatus();
console.log(status);

// Arrêter
monitor.stop();
```

## Debugging

Activer les logs détaillés :
```bash
DEBUG=* node scripts/monitor-standalone.js
```

## Problèmes courants

### "Borne non détectée"
- Vérifier la connexion réseau
- S'assurer que le routeur par défaut est accessible
- Vérifier les permissions pour exécuter `netsh wlan` (Windows)

### "SNMP timeout"
- Vérifier que SNMP est activé sur le routeur
- Vérifier la communauté SNMP (par défaut: "public")
- Vérifier l'index d'interface SNMP

### "Erreur d'authentification API"
- Vérifier que le token JWT n'a pas expiré
- Vérifier que l'API est accessible
- Vérifier les credentials

## Dépendances

- `axios` : Requêtes HTTP
- `ping` : Tests de connectivité
- `net-snmp` : Requêtes SNMP
- `express` : Framework API
- `mongodb/mongoose` : Base de données
