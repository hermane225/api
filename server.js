import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB(process.env.MONGO_URI); // passe bien l'URI
    app.listen(PORT, () => {
      console.log(` Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erreur démarrage :", error);
    process.exit(1);
  }
})();
