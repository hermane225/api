import Agent from "../models/Agent.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const listAgents = async (req, res, next) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) { next(err); }
};

export const createAgent = async (req, res, next) => {
  try {
    const { login, password, firstName, lastName, contact, idType, idNumber, region } = req.body;
    
    // Vérifier que le login n'existe pas
    const existing = await User.findOne({ login });
    if (existing) return res.status(400).json({ message: "Login déjà utilisé" });
    
    const hashed = await bcrypt.hash(password || "changeme", 10);
    
    // Créer l'utilisateur avec le rôle "agent"
    const user = await User.create({
      login,
      password: hashed,
      name: `${firstName} ${lastName}`,
      role: "agent",
      profile: {
        photo: req.body.photo || "",
        lastName: lastName || "",
        firstName: firstName || "",
        contact: contact || "",
        idType: idType || "",
        idNumber: idNumber || "",
        region: region || "",
      }
    });
    
    // Optionnel: créer aussi dans la collection Agent pour la rétrocompatibilité
    const agent = await Agent.create({ 
      ...req.body, 
      password: hashed,
      firstName,
      lastName
    });
    
    res.status(201).json({
      message: "✅ Agent créé avec succès",
      user: {
        id: user._id,
        login: user.login,
        role: user.role,
        name: user.name,
        profile: user.profile
      },
      agent: agent
    });
  } catch (err) { next(err); }
};

export const updateAgent = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
    const agent = await Agent.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(agent);
  } catch (err) { next(err); }
};

export const deleteAgent = async (req, res, next) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ message: "Agent supprimé" });
  } catch (err) { next(err); }
};
