import Borne from "../models/Borne.js";

export const listBornes = async (req, res, next) => {
  try {
    const bornes = await Borne.find();
    res.json(bornes);
  } catch (err) { next(err); }
};

export const createBorne = async (req, res, next) => {
  try {
    const borne = await Borne.create(req.body);
    res.status(201).json(borne);
  } catch (err) { next(err); }
};

export const getBorne = async (req, res, next) => {
  try {
    const borne = await Borne.findById(req.params.id);
    if (!borne) return res.status(404).json({ message: "Borne introuvable" });
    res.json(borne);
  } catch (err) { next(err); }
};

export const updateBorne = async (req, res, next) => {
  try {
    const borne = await Borne.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(borne);
  } catch (err) { next(err); }
};

export const stats = async (req, res, next) => {
  try {
    const totalTraffic = await Borne.aggregate([{ $group: { _id: null, total: { $sum: "$traffic" } } }]);
    const count = await Borne.countDocuments();
    res.json({ totalTraffic: totalTraffic[0]?.total || 0, totalBornes: count });
  } catch (err) { next(err); }
};
