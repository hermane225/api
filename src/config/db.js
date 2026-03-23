import mongoose from "mongoose";

const connectDB = async (mongoURI) => {
  try {
    if (!mongoURI) throw new Error("MONGO_URI non défini");
    
    await mongoose.connect(mongoURI, {
      // Reconnexion automatique
      retryWrites: true,
      w: 'majority',
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      
      // Pool de connexions
      minPoolSize: 5,
      maxPoolSize: 10
    });
    
    // Event listeners pour diagnostiquer les problèmes
    mongoose.connection.on('connecting', () => {
      console.log("🔄 Connexion à MongoDB en cours...");
    });
    
    mongoose.connection.on('connected', () => {
      console.log("✅ MongoDB connecté");
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn("⚠️ MongoDB déconnecté");
    });
    
    mongoose.connection.on('error', (err) => {
      console.error("❌ Erreur MongoDB:", err.message);
    });
    
  } catch (err) {
    console.error("❌ Erreur connexion MongoDB :", err.message);
    throw err;
  }
};

export default connectDB;
