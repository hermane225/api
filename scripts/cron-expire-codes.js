/**
 * Script Cron pour l'expiration automatique des codes Wi-Fi
 * 
 * Ce script vérifie régulièrement les codes expirés et les désactive
 * à la fois dans la base de données et sur le MikroTik.
 * 
 * Usage:
 *   - Lancer avec: node scripts/cron-expire-codes.js
 *   - Configurer dans crontab toutes les 5 minutes
 *   - Ou intégrer avec node-cron dans le serveur principal
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Code from '../src/models/code.js';
import { mikrotikApi } from '../src/utils/mikrotikApi.js';

// Charger les variables d'environnement
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/village-connecte';

/**
 * Fonction principale d'expiration des codes
 */
async function expireOldCodes() {
  const startTime = Date.now();
  console.log(`\n🕐 [${new Date().toISOString()}] Début du processus d'expiration des codes...`);

  try {
    // Connexion à MongoDB si pas déjà connecté
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI);
      console.log('📦 Connecté à MongoDB');
    }

    const now = new Date();
    
    // Trouver tous les codes actifs qui sont expirés
    const expiredCodes = await Code.find({
      status: 'active',
      dateExpiration: { $lt: now }
    });

    if (expiredCodes.length === 0) {
      console.log('✅ Aucun code expiré à traiter');
      return { processed: 0, mikrotikRemoved: 0, errors: [] };
    }

    console.log(`📋 ${expiredCodes.length} code(s) expiré(s) trouvé(s)`);

    const results = {
      processed: 0,
      mikrotikRemoved: 0,
      errors: []
    };

    // Traiter chaque code expiré
    for (const code of expiredCodes) {
      try {
        console.log(`  🔄 Traitement du code: ${code.code}`);

        // Supprimer de MikroTik si synchronisé
        if (code.mikrotikSynced) {
          const mikrotikResult = await mikrotikApi.removeHotspotUser(code.code);
          if (mikrotikResult.success) {
            results.mikrotikRemoved++;
            console.log(`    ✅ Supprimé de MikroTik`);
          } else {
            results.errors.push({ 
              code: code.code, 
              error: mikrotikResult.error,
              type: 'mikrotik'
            });
            console.log(`    ⚠️ Erreur MikroTik: ${mikrotikResult.error}`);
          }
        }

        // Mettre à jour le statut en base
        code.status = 'expired';
        code.mikrotikSynced = false;
        await code.save();
        results.processed++;
        console.log(`    ✅ Statut mis à jour en base`);

      } catch (error) {
        results.errors.push({ 
          code: code.code, 
          error: error.message,
          type: 'database'
        });
        console.error(`    ❌ Erreur: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`\n📊 Résumé:`);
    console.log(`   - Codes traités: ${results.processed}/${expiredCodes.length}`);
    console.log(`   - Supprimés de MikroTik: ${results.mikrotikRemoved}`);
    console.log(`   - Erreurs: ${results.errors.length}`);
    console.log(`   - Durée: ${duration}ms`);

    return results;

  } catch (error) {
    console.error(`❌ Erreur fatale: ${error.message}`);
    throw error;
  }
}

/**
 * Fonction pour lancer en mode autonome
 */
async function main() {
  try {
    await expireOldCodes();
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  } finally {
    // Fermer la connexion si lancé en mode autonome
    if (process.argv[1].includes('cron-expire-codes')) {
      await mongoose.disconnect();
      console.log('🔌 Déconnecté de MongoDB');
      process.exit(0);
    }
  }
}

// Lancer si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { expireOldCodes };
export default expireOldCodes;
