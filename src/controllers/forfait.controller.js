import Forfait from "../models/Forfait.js";

export const listForfaits = async (req, res, next) => {
  try {
    const items = await Forfait.find();
    res.json(items);
  } catch (err) { next(err); }
};

export const createForfait = async (req, res, next) => {
  try {
    const f = await Forfait.create(req.body);
    res.status(201).json(f);
  } catch (err) { next(err); }
};

export const updateForfait = async (req, res, next) => {
  try {
    const f = await Forfait.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(f);
  } catch (err) { next(err); }
};

export const deleteForfait = async (req, res, next) => {
  try {
    await Forfait.findByIdAndDelete(req.params.id);
    res.json({ message: "Forfait supprimé" });
  } catch (err) { next(err); }
};
