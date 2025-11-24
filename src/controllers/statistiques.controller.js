import Statistique from "../models/Statistique.js";
import Forfait from "../models/Forfait.js";

// Crée une entrée de statistique (ex: quand un utilisateur se connecte / valide un code)
export const createStatistique = async (req, res, next) => {
  try {
    const { datetime, code, forfait, forfaitType, user } = req.body;
    const stat = await Statistique.create({ datetime, code, forfait, forfaitType, user });
    return res.status(201).json(stat);
  } catch (err) {
    return next(err);
  }
};

// Récupère les statistiques pour une date (query param `date` au format YYYY-MM-DD)
// Retourne un objet récapitulatif: date, totalEvents, uniqueUsers, rows[{date, heure, code, forfaitType, user}]
export const getByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    let start; let end;
    if (date) {
      start = new Date(date);
      start.setHours(0,0,0,0);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    } else {
      const now = new Date();
      start = new Date(now);
      start.setHours(0,0,0,0);
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    }

    const stats = await Statistique.find({ datetime: { $gte: start, $lt: end } })
      .populate('forfait')
      .sort({ datetime: 1 });

    const rows = stats.map(s => ({
      date: s.datetime.toISOString().split('T')[0],
      heure: s.datetime.toISOString().split('T')[1].slice(0,8),
      code: s.code || (s.forfait ? s.forfait._id : null),
      forfaitType: s.forfaitType || (s.forfait ? s.forfait.name : null),
      user: s.user || null
    }));

    const uniqueUsers = new Set(stats.map(s => s.user).filter(Boolean));

    return res.json({
      date: start.toISOString().split('T')[0],
      totalEvents: stats.length,
      uniqueUsers: uniqueUsers.size,
      rows
    });
  } catch (err) {
    return next(err);
  }
};
