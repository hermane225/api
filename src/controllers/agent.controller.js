import Agent from "../models/Agent.js";
import bcrypt from "bcryptjs";

export const listAgents = async (req, res, next) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) { next(err); }
};

export const createAgent = async (req, res, next) => {
  try {
    const { login, password } = req.body;
    const hashed = await bcrypt.hash(password || "changeme", 10);
    const agent = await Agent.create({ ...req.body, password: hashed });
    res.status(201).json(agent);
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
