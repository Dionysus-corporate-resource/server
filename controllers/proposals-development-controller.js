import { validationResult } from "express-validator";
import ProposalsDevelopmentModel from "../models/proposals-development.js";

export const proposalsDevelopment = {
  create: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    try {
      const doc = new ProposalsDevelopmentModel({
        name: req.body.name,
        description: req.body.description,
        topic: req.body.topic,
        status: "pending",
        user: req.userId,
      });

      const proposalsDevelopment = await doc.save();
      res.json(proposalsDevelopment);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Ошибка при создании booking" });
    }
  },
  getAll: async (req, res) => {
    try {
      const proposalsDevelopment = await ProposalsDevelopmentModel.find()
        .populate("user")
        .exec();
      res.json(proposalsDevelopment);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Не удалось получить предложения" });
    }
  },
};
