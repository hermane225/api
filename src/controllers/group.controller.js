import Group from "../models/Group.js";

//  Créer un groupe
export const createGroup = async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Lister tous les groupes
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Obtenir un groupe par ID
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Groupe non trouvé" });
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Modifier un groupe
export const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!group) return res.status(404).json({ message: "Groupe non trouvé" });
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Supprimer un groupe
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ message: "Groupe non trouvé" });
    res.status(200).json({ message: "Groupe supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
