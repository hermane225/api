import dotenv from "dotenv";
dotenv.config();

import app, { borneMonitor } from "./src/app.js";
import connectDB from "./src/config/db.js";
import mongoose from "mongoose";

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
        borneMonitor.start().catch(err => {
          console.warn("⚠️ Monitoring n'a pas pu démarrer:", err.message);
        });
      } else {
        console.log("ℹ️ Monitoring inactif. Démarrer via POST /api/monitoring/start");
      }
    });

    // Graceful shutdown avec gestion de MongoDB
    const gracefulShutdown = async () => {
      console.log('📴 Arrêt du serveur...');
      borneMonitor.stop();
      
      // Attendre que les requêtes actuelles se terminent
      server.close(async () => {
        console.log('❌ Serveur arrêté');
        
        // Fermer la connexion MongoDB
        try {
          await mongoose.connection.close();
          console.log('❌ Connexion MongoDB fermée');
        } catch (err) {
          console.error('❌ Erreur fermeture MongoDB:', err.message);
        }
        
        process.exit(0);
      });
      
      // Timeout forcé après 30 secondes
      setTimeout(() => {
        console.error('⚠️ Shutdown timeout, forçage de l\'arrêt...');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error("❌ Erreur démarrage :", error.message);
    process.exit(1);
  }
})();
