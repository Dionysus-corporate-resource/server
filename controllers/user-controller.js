import { validationResult } from "express-validator";
import UserModel from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const auth = {
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const existingUser = await UserModel.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          message: "Пользователь с такой почтой уже существует",
        });
      }

      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const doc = new UserModel({
        email: req.body.email,
        userName: req.body.userName,
        passwordHash: hash,
        phone: req.body.phone,
      });

      const user = await doc.save();
      const token = jwt.sign(
        {
          _id: user._id,
        },
        "secret123",
        { expiresIn: "30d" },
      );

      const { passwordHash, ...userData } = user._doc;

      res.json({ ...userData, token });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Не удалось зарегистрироваться",
      });
    }
  },
  login: async (req, res) => {
    try {
      const user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        return res
          .status(404)
          .json({ message: "Пользователя с такой почтой не существует" });
      }

      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user._doc.passwordHash,
      );
      if (!isValidPassword) {
        return res.status(404).json({ message: "Не верный логин или пароль" });
      }

      const token = jwt.sign(
        {
          _id: user._id,
        },
        "secret123",
        { expiresIn: "30d" },
      );
      const { passwordHash, ...userData } = user._doc;

      res.json({ ...userData, token });
    } catch (err) {
      res.status(500).json({
        message: "Не удалось автоизироваться",
      });
    }
  },
  getMe: async (req, res) => {
    try {
      const user = await UserModel.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          message: "Пользователь не найден",
        });
      }

      const { passwordHash, ...userData } = user._doc;

      res.json(userData);
    } catch (err) {
      res.status(400).json({
        message: "Не верный token",
      });
    }
  },
};
