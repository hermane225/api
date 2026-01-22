import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import User from "./src/models/User.js";
import bcrypt from "bcryptjs";

const createUser = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    
    const login = "hermane";
    const password = "hermane2005";
    const name = "Hermane";
    
    // Vérifier si l'utilisateur existe déjà
    const existing = await User.findOne({ login });
    if (existing) {
      console.log("✅ L'utilisateur 'hermane' existe déjà");
      process.exit(0);
    }
    
    // Hacher le mot de passe
    const hash = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const user = await User.create({
      login,
      password: hash,
      name,
      role: "admin", // Rôle admin pour accéder au monitoring
    });
    
    console.log("✅ Utilisateur créé avec succès:");
    console.log(`   - Login: ${user.login}`);
    console.log(`   - Nom: ${user.name}`);
    console.log(`   - Rôle: ${user.role}`);
    console.log(`   - ID: ${user._id}`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
};

createUser();
