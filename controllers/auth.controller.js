import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

export const authControllers = {
  register: async (req, res) => {
    try {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          message: "Пользователь с такой почтой уже существует",
        });
      }

      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // если нет названии компании, значит регистрируем его как водитель
      if (!req.body.companyName) {
        const doc = new User({
          email: req.body.email,
          passwordHash: hash,
          phone: req.body.phone,
          roles: "driver",
          companyName: null,
          activeSubscriptions: {
            purchasedBooking: { remainingBookings: 0 },
            unLimitedBookingSubscription: { isPurchased: false },
            showContactSubscription: { isPurchased: false },
          },
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

        return res.status(200).json({ ...userData, token });
      }

      // если есть название компании, значит регистрируем его как заказчик
      const docUser = new User({
        email: req.body.email,
        passwordHash: hash,
        phone: req.body.phone,
        roles: "customer",
        companyName: req.body.companyName,
        activeSubscriptions: {
          purchasedBooking: { remainingBookings: 0 },
          unLimitedBookingSubscription: { isPurchased: false },
          showContactSubscription: { isPurchased: false },
        },
      });
      const savedUserCustomer = await docUser.save();

      // Подтягиваем пользователя
      const populatedUser = await User.findById(savedUserCustomer._id);

      const token = jwt.sign(
        {
          _id: savedUserCustomer._id,
        },
        "secret123",
        { expiresIn: "30d" },
      );
      const { passwordHash, ...userData } = populatedUser._doc;

      return res.status(200).json({ ...userData, token });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Не удалось зарегистрироваться",
      });
    }
  },
  login: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });

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

      res.status(200).json({ ...userData, token });
    } catch (err) {
      res.status(500).json({
        message: "Не удалось автоизироваться",
      });
    }
  },
  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          message: "Пользователь не найден",
        });
      }

      const { passwordHash, ...userData } = user._doc;

      res.json(userData);
    } catch (err) {
      res.status(500).json({
        message: "Не вышло получить данные пользователя",
      });
    }
  },
};
