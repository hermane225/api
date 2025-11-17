import mongoose from "mongoose";

const connectDB = async (mongoURI) => {
  try {
    if (!mongoURI) throw new Error("MONGO_URI non défini");
    await mongoose.connect(mongoURI);
    console.log(" MongoDB connecté");
  } catch (err) {
    console.error("Erreur connexion MongoDB :", err);
    throw err;
  }
};

export default connectDB;
