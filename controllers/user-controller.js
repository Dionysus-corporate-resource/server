import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
// models
import Logistician from "../models/logistician.js"
import CompanyPublic from "../models/company-public.js"


// Данные для регистрации
// Водитель - email, password, phone
// Заказчик - email, password, phone + nameCompany


export const authPublicSite = {
  register: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const existingUser = await Logistician.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          message: "Пользователь с такой почтой уже существует",
        });
      }

      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // если нет названии компании, значит регистрируем его как водитель
      if (!req.body.nameCompany) {

        const doc = new Logistician({
            email: req.body.email,
            passwordHash: hash,
            phone: req.body.phone,
            roles: "driver"
        });
        const userDriver = await doc.save();

        const token = jwt.sign(
            {
              _id: userDriver._id,
            },
            "secret123",
            { expiresIn: "30d" },
          );

        const { passwordHash, ...userData } = userDriver._doc;

        return res.json({ ...userData, token });
      }

      // если ечть название компании, значит регистрируем его как заказчик
      // создаем компанию
      // сначала проверяем существует ли компания с таким именем в модели
      const isExistCompany = await CompanyPublic.findOne({ nameCompany: req.body.nameCompany});

      // есди компания с именем уже существует, просто привязываем к сущности пользователя id компании
      if (isExistCompany) {
        //
        const docLogistician = new Logistician({
            email: req.body.email,
            passwordHash: hash,
            phone: req.body.phone,
            roles: "customer",
            companyPublicData: isExistCompany._id
        });
        const savedUserCustomer = await docLogistician.save();

        // Подтягиваем объект компании в поле companyPublicData
        const populatedUser = await Logistician.findById(savedUserCustomer._id)
        .populate("companyPublicData") // Заполняем объект компании
        .exec();

        const token = jwt.sign(
            {
            _id: savedUserCustomer._id,
            },
            "secret123",
            { expiresIn: "30d" },
        );
        const { passwordHash, ...userData } = populatedUser._doc;

        return res.json({ ...userData, token });
      }

      // Если компании не существует, создаем компанию и достаем ее id,
      // после привязываем к сущности пользователя и создаем его

      const docCompanyPublic = new CompanyPublic({
        nameCompany: req.body.nameCompany,
      });
      const savedCompanyPublic = await docCompanyPublic.save();

      const docLogistician = new Logistician({
        email: req.body.email,
        passwordHash: hash,
        phone: req.body.phone,
        roles: "customer",
        companyPublicData: savedCompanyPublic._id
    });
    const savedUserCustomer = await docLogistician.save();

    // Подтягиваем объект компании в поле companyPublicData
    const populatedUser = await Logistician.findById(savedUserCustomer._id)
    .populate("companyPublicData") // Заполняем объект компании
    .exec();

    const token = jwt.sign(
        {
          _id: savedUserCustomer._id,
        },
        "secret123",
        { expiresIn: "30d" },
      );
    const { passwordHash, ...userData } = populatedUser._doc;

    return res.json({ ...userData, token });

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
