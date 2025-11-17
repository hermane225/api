import Transactions from "../models/Transactions.js";

export const listTransactions = async (req, res, next) => {
  try {
    const { agent, from, to } = req.query;
    const filter = {};
    if (agent) filter.agent = agent;
    if (from || to) filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);

    const items = await Transactions.find(filter).populate("agent forfait").sort({ date: -1 });
    res.json(items);
  } catch (err) { next(err); }
};

export const createTransaction = async (req, res, next) => {
  try {
    const t = await Transactions.create(req.body);
    res.status(201).json(t);
  } catch (err) { next(err); }
};

export const summary = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const match = {};
    if (from || to) match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);

    const agg = await Transactions.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);
    res.json(agg[0] || { total: 0, count: 0 });
  } catch (err) { next(err); }
};
