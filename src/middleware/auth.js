import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ message: "Token manquant" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; //  id, role.
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide", error: err.message });
  }
};

// middleware role-based
export const permit = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Non authentifié" });
  if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: "Accès refusé" });
  next();
};
