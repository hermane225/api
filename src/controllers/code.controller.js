import Code from "../models/code.js";
import { generateRandomCode } from "../utils/generateCode.js";
import Forfait from "../models/Forfait.js";

export const generateCodes = async (req, res, next) => {
  try {
    const { forfaitId, count = 1 } = req.body;
    const forfait = await Forfait.findById(forfaitId);
    if (!forfait) return res.status(404).json({ message: "Forfait introuvable" });

    const created = [];
    for (let i = 0; i < count; i++) {
      const codeStr = generateRandomCode(10);
      const code = await Code.create({
        code: codeStr,
        forfait: forfait._id,
        category: forfait.category,
        durationValue: forfait.durationValue,
        price: forfait.price,
        generatedBy: req.user?.id
      });
      created.push(code);
    }
    res.status(201).json(created);
  } catch (err) { next(err); }
};

export const listCodes = async (req, res, next) => {
  try {
    const codes = await Code.find().populate("forfait").sort({ createdAt: -1 });
    res.json(codes);
  } catch (err) { next(err); }
};

export const assignCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userLogin } = req.body;
    const code = await Code.findByIdAndUpdate(id, { used: true, usedBy: userLogin }, { new: true });
    res.json(code);
  } catch (err) { next(err); }
};
