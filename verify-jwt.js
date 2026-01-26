import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script pour décoder et vérifier le contenu d'un JWT
 * Utilisation: node verify-jwt.js "ton_token_ici"
 */

const token = process.argv[2];

if (!token) {
  console.error("❌ Veuillez fournir un token JWT");
  console.log("Utilisation: node verify-jwt.js 'ton_token_ici'");
  process.exit(1);
}

try {
  // Décoder SANS vérifier la signature (pour voir le contenu)
  const decoded = jwt.decode(token, { complete: true });
  
  if (!decoded) {
    console.error("❌ Token invalide");
    process.exit(1);
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("📋 CONTENU DU JWT");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log("📍 HEADER:");
  console.log(JSON.stringify(decoded.header, null, 2));

  console.log("\n📍 PAYLOAD:");
  console.log(JSON.stringify(decoded.payload, null, 2));

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("✅ ANALYSE");
  console.log("═══════════════════════════════════════════════════════\n");

  const { role, id, login } = decoded.payload;

  console.log(`🆔 ID utilisateur: ${id}`);
  console.log(`👤 Login: ${login}`);
  console.log(`🔐 Rôle: "${role}"`);

  // Vérifier si le rôle est valide
  const validRoles = ["admin", "agent", "user"];
  
  if (!validRoles.includes(role)) {
    console.log(`\n⚠️  ERREUR: Le rôle "${role}" n'est pas valide !`);
    console.log(`   Les rôles valides sont: ${validRoles.join(", ")}`);
  } else {
    console.log(`\n✅ Le rôle est valide: "${role}"`);
  }

  // Vérifier l'expiration
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = decoded.payload.exp;
  const timeUntilExpire = expiresAt - now;

  if (timeUntilExpire > 0) {
    console.log(`⏱️  Expire dans: ${Math.floor(timeUntilExpire / 60)} minutes`);
  } else {
    console.log(`⏱️  ❌ TOKEN EXPIRÉ il y a ${Math.floor(Math.abs(timeUntilExpire) / 60)} minutes`);
  }

  console.log("\n═══════════════════════════════════════════════════════\n");

} catch (err) {
  console.error("❌ Erreur en décodant le token:", err.message);
  process.exit(1);
}
