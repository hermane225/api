import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

/**
 * Script pour corriger les rôles en base de données
 * Options:
 *   - show-all: Affiche tous les utilisateurs
 *   - fix-role [login] [newRole]: Corrige le rôle d'un utilisateur
 *   - fix-typos: Corrige les typos courants (admi -> admin, etc)
 */

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connecté à MongoDB\n");
  } catch (err) {
    console.error("❌ Erreur connexion MongoDB:", err.message);
    process.exit(1);
  }
}

async function showAllUsers() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("📋 TOUS LES UTILISATEURS");
  console.log("═══════════════════════════════════════════════════════\n");

  const users = await User.find({}, "-password");
  
  if (users.length === 0) {
    console.log("❌ Aucun utilisateur trouvé");
    return;
  }

  users.forEach((user, idx) => {
    const validRoles = ["admin", "agent", "user"];
    const roleStatus = validRoles.includes(user.role) ? "✅" : "⚠️";
    console.log(`${idx + 1}. ${user.login} (${roleStatus} ${user.role}) - ID: ${user._id}`);
  });

  console.log("\n" + "═".repeat(55) + "\n");
}

async function fixRole(login, newRole) {
  console.log(`\n🔧 Correction du rôle pour "${login}" → "${newRole}"\n`);

  const validRoles = ["admin", "agent", "user"];
  if (!validRoles.includes(newRole)) {
    console.log(`❌ Rôle invalide "${newRole}". Rôles valides: ${validRoles.join(", ")}`);
    return;
  }

  const user = await User.findOne({ login });
  if (!user) {
    console.log(`❌ Utilisateur "${login}" non trouvé`);
    return;
  }

  const oldRole = user.role;
  user.role = newRole;
  await user.save();

  console.log(`✅ Rôle corrigé: "${oldRole}" → "${newRole}"`);
  console.log(`   Login: ${user.login}`);
  console.log(`   ID: ${user._id}\n`);
}

async function fixTypos() {
  console.log("\n🔍 Recherche des typos...\n");

  const typoMap = {
    "admi": "admin",
    "admin ": "admin", // avec espace
    "admim": "admin",
    "agent ": "agent",
    "usr": "user",
    "utilisateur": "user",
  };

  let fixed = 0;

  for (const [typo, correct] of Object.entries(typoMap)) {
    const users = await User.find({ role: typo });
    
    if (users.length > 0) {
      console.log(`Found ${users.length} user(s) with role "${typo}". Fixing to "${correct}"...`);
      
      await User.updateMany(
        { role: typo },
        { role: correct }
      );
      
      fixed += users.length;
      console.log(`✅ ${users.length} utilisateur(s) corrigé(s)\n`);
    }
  }

  if (fixed === 0) {
    console.log("✅ Aucun typo trouvé. Tous les rôles sont corrects !\n");
  } else {
    console.log(`\n✅ Total: ${fixed} utilisateur(s) ont été corrigés\n`);
  }
}

// MAIN
(async () => {
  await connectDB();

  if (!command) {
    console.log("Usage:");
    console.log("  node fix-roles.js show-all              → Affiche tous les utilisateurs");
    console.log("  node fix-roles.js fix-role [login] [role] → Corrige le rôle d'un utilisateur");
    console.log("  node fix-roles.js fix-typos              → Corrige les typos courants");
    console.log("\nExemples:");
    console.log("  node fix-roles.js show-all");
    console.log("  node fix-roles.js fix-role john admin");
    console.log("  node fix-roles.js fix-typos\n");
    process.exit(0);
  }

  try {
    if (command === "show-all") {
      await showAllUsers();
    } else if (command === "fix-role") {
      if (!arg1 || !arg2) {
        console.log("❌ Utilisation: node fix-roles.js fix-role [login] [role]");
        process.exit(1);
      }
      await fixRole(arg1, arg2);
    } else if (command === "fix-typos") {
      await fixTypos();
    } else {
      console.log(`❌ Commande inconnue: ${command}`);
    }
  } catch (err) {
    console.error("❌ Erreur:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("✅ Déconnecté de MongoDB");
  }
})();
