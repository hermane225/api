import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import User from "./src/models/User.js";

const changeRole = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    
    const user = await User.findOneAndUpdate(
      { login: "hermane" },
      { role: "admin" },
      { new: true }
    );
    
    if (!user) {
      console.log("❌ Utilisateur 'hermane' non trouvé");
      process.exit(1);
    }
    
    console.log("✅ Rôle changé avec succès:");
    console.log(`   - Login: ${user.login}`);
    console.log(`   - Rôle: ${user.role}`);
    console.log(`   - ID: ${user._id}`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
};

changeRole();
