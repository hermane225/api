import Alerte from "../models/Alerte.js";

export const listAlertes = async (req, res, next) => {
  try {
    const { status, code } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (code) filter.code = Number(code);
    const alertes = await Alerte.find(filter).sort({ createdAt: -1 });
    res.json(alertes);
  } catch (err) { next(err); }
};

export const createAlerte = async (req, res, next) => {
  try {
    const a = await Alerte.create(req.body);
    res.status(201).json(a);
  } catch (err) { next(err); }
};

export const updateAlerte = async (req, res, next) => {
  try {
    const a = await Alerte.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(a);
  } catch (err) { next(err); }
};

export const deleteAlerte = async (req, res, next) => {
  try {
    await Alerte.findByIdAndDelete(req.params.id);
    res.json({ message: "Alerte supprimée" });
  } catch (err) { next(err); }
};
