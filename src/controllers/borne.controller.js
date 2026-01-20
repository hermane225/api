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

// Recevoir les données push de la borne (sans authentification requise)
export const pushBorneData = async (req, res, next) => {
  try {
    const { ip, name, status, snmp, lastSeen } = req.body;

    if (!ip) {
      return res.status(400).json({ message: "IP de la borne requise" });
    }

    // Chercher la borne existante par IP
    let borne = await Borne.findOne({ ip });

    if (borne) {
      // Mettre à jour la borne existante
      borne.status = status || borne.status;
      borne.name = name || borne.name;
      borne.lastSeen = lastSeen || new Date();
      if (snmp) borne.snmp = snmp;
      await borne.save();
      res.json({ message: "Borne mise à jour", borne });
    } else {
      // Créer une nouvelle borne
      borne = await Borne.create({
        ip,
        name: name || `Borne ${ip}`,
        status: status || "HORS_LIGNE",
        lastSeen: lastSeen || new Date(),
        snmp: snmp || {},
      });
      res.status(201).json({ message: "Borne créée", borne });
    }
  } catch (err) { next(err); }
};
