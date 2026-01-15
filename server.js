import dotenv from "dotenv";
dotenv.config();

import app, { borneMonitor } from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;
const AUTO_START_MONITORING = process.env.AUTO_START_MONITORING === 'true';

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    
    const server = app.listen(PORT, async () => {
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
      
      // Démarrer le monitoring automatiquement si configuré
      if (AUTO_START_MONITORING) {
        console.log("🚀 Démarrage automatique du monitoring des bornes...");
        await borneMonitor.start();
      } else {
        console.log("ℹ️ Monitoring inactif. Démarrer via POST /api/monitoring/start");
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📴 Arrêt du serveur...');
      borneMonitor.stop();
      server.close(() => {
        console.log('❌ Serveur arrêté');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("❌ Erreur démarrage :", error);
    process.exit(1);
  }
})();
