import CompanyModel from "../models/company.js";
import LogisticianModel from "../models/logistician.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const company = {
  registerCompany: async (req, res) => {
    // существует ли компания
    const existingCompany = await CompanyModel.findOne({
      nameCompany: req.body.nameCompany,
    });
    if (existingCompany) {
      return res.status(400).json({
        message: "Компания с таким именем уже существует",
      });
    }

    // Проверяем есть ои такой логист
    const existingLogistician = await LogisticianModel.findOne({
      email: req.body.email,
    });
    // Если логист еще не регистрировался и его нет и хочет создать компанию
    if (!existingLogistician) {
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // регистрируем его как логиста с ролью general_director
      const doc = new LogisticianModel({
        email: req.body.email,
        userName: req.body.userName,
        passwordHash: hash,
        phone: req.body.phone,
        roles: ["general_director"],
        // req.body.roles - ["general_director"]
      });
      // сохраянем логиста в общей базе
      const logistician = await doc.save();

      // создаем компанию и добавляем в него уже созданого сотрудника
      const docCompany = new CompanyModel({
        nameCompany: req.body.nameCompany,
        employees: [
          {
            additionalInfo: "General Director additionalInfo",
            userData: logistician._id, // Ссылка на логиста
            corporatePasswordHash: hash,
            corporateRoles: ["general_director"],
          },
        ],
        booking: [],
      });
      const company = await docCompany.save();

      const token = jwt.sign(
        {
          _idCompany: company._id,
          _idLogistician: logistician._id,
          rolesLogistician: ["general_director"],
        },
        "secret123",
        { expiresIn: "30d" },
      );

      return res.json({ token, logistician });
    }

    // Если уже зарегестрирован и хочет создать компанию
    const logistician = await LogisticianModel.findOne({
      email: req.body.email,
    });

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // создаем компанию и добавляем в него уже созданого сотрудника
    const docCompany = new CompanyModel({
      nameCompany: req.body.nameCompany,
      employees: [
        {
          additionalInfo: "General Director additionalInfo",
          userData: logistician._id, // Ссылка на логиста
          corporatePasswordHash: hash,
          corporateRoles: ["general_director"],
        },
      ],
      booking: [],
    });
    const company = await docCompany.save();

    const token = jwt.sign(
      {
        _idCompany: company._id,
        _idLogistician: logistician._id,
        rolesLogistician: ["general_director"],
      },
      "secret123",
      { expiresIn: "30d" },
    );

    return res.json({ token, docCompany });
  },
  login: async (req, res) => {
    // Ищем существует ли компания с таким именем
    const existingCompany = await CompanyModel.findOne({
      nameCompany: req.body.nameCompany,
    })
      .populate({
        path: "employees.userData", // Указываем поле, которое хотим заполнить
      })
      .exec();
    // Если такой компании не существует
    if (!existingCompany) {
      return res.status(404).json({
        message: "Такой компании не существует",
      });
    }

    // Проверяем есть ли такая почта хотя-бы у одного сотрудника компании
    const existingEmmailLogisticianInCompany = existingCompany.employees.find(
      (employee) => employee.userData.email === req.body.email,
    );

    // Если нет
    if (!existingEmmailLogisticianInCompany) {
      res.status(404).json({
        message: "Вы не сотрудник этой компании",
      });
    }

    // проверка на правильнось введенного пароля
    const isValidPassword = await bcrypt.compare(
      req.body.password,
      existingEmmailLogisticianInCompany._doc.corporatePasswordHash,
    );
    if (!isValidPassword) {
      return res
        .status(404)
        .json({ message: "Не верный корпоративный пароль" });
    }

    // Если пароль верный
    const token = jwt.sign(
      {
        _idCompany: existingCompany._id,
        _idLogistician: existingEmmailLogisticianInCompany.userData._id,
        rolesLogistician: existingEmmailLogisticianInCompany.corporateRoles,
      },
      "secret123",
      { expiresIn: "30d" },
    );
    res.json({
      token,
      existingEmmailLogisticianInCompany,
    });
  },
  registerLogisticianInCompany: async (req, res) => {
    const logisticianCompany = await CompanyModel.findOne({
      _id: req.token._idCompany,
    }).populate({
      path: "employees.userData", // Заполняем поле userData данными из Logistician
      // select: "email", // Забираем только поле email
    });
    // Если компания не существует
    if (!logisticianCompany) {
      return res.status(404).json({
        message: "Такой компании не существует",
      });
    }

    // Есть ли уже сотрудник с такой почтой
    const existingLogicyicianWithThisEmail = logisticianCompany.employees.find(
      (employee) => employee.userData.email === req.body.email,
    );
    // Если нашел сотрудника с такой почтой
    if (existingLogicyicianWithThisEmail) {
      return res.status(400).json({
        message: "Сотрудник с такой почтой уже сущесвтует в вашей компании",
      });
    }

    // Проверка - зарегистрирован ли такой логист под этой почтой в общей базе
    const existingLogistician = await LogisticianModel.findOne({
      email: req.body.email,
    });
    // Если логист еще не регистрировался в общей базе и хочет попасть в компанию
    // По факту тут генДиректор придумывает ему пароль как для корпоративного ресурса так и для общего сайта
    if (!existingLogistician) {
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // регистрируем его как логиста с ролью dispatcher по умолчанию
      const doc = new LogisticianModel({
        email: req.body.email,
        userName: req.body.userName,
        passwordHash: hash,
        phone: req.body.phone,
        roles: ["dispatcher"],
      });
      // сохраянем логиста в общей базе
      const logistician = await doc.save();

      const newEmployee = {
        additionalInfo: "additionaly info",
        userData: logistician._id,
        corporatePasswordHash: hash,
        corporateRoles: ["dispatcher"],
      };

      // Добавляем объект в массив employees
      logisticianCompany.employees.push(newEmployee);
      await logisticianCompany.save();

      return res.json({
        message: "Пользователь зарегистрирован и добавлен",
      });
    }

    // Если пользователь уже существует в общей базе логистов
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newEmployee = {
      additionalInfo: "additionaly info",
      userData: existingLogistician._id,
      corporatePasswordHash: hash,
      corporateRoles: ["dispatcher"],
    };

    logisticianCompany.employees.push(newEmployee);
    await logisticianCompany.save();

    res.json({
      message: "Сотрудник успешно добавлен",
      logisticianCompany,
    });
  },
};

// const existingCompany = await CompanyModel.findOne({ nameCompany: req.body.nameCompany });

// if (!logisticianCompany) {
//   return res.status(404).json({
//     message: "Компания не найдена, или пустой штат сотрудников",
//   });
// }

// // Проверяем есть ли такой пользователь с такой почтой
// const isEmailExist = logisticianCompany.employees.some((employee) => {
//   // console.log("employee", employee);
//   // if (!employee.userData.email) {
//   //   return false;
//   // }
//   return employee.userData.email === req.body.email;
// });

// if (isEmailExist) {
//   return res.status(401).json({
//     message: "Email уже существует в массиве employees",
//   });
// }

// Создаем нового сотрудника
// const newEmployee = {
//   userData: {
//     userName: req.body.userName,
//     email: ,
//     passwordHash: { type: String, require: true },
//     phone: { type: String, require: true },
//     roles: {
//       type: [String],
//       enum: ["super_viser", "dispatcher", "manager", "general_director"],
//       default: [],
//     },
//   },
//   additionalInfo: "Additionally info", // Дополнительная информация
// };

// const result = await CompanyModel.updateOne(
//   { _id: req.token._idCompany }, // Условие поиска
//   { $push: { employees: newEmployee } }, // Добавляем в массив
// );

// if (result.modifiedCount > 0) {
//   return res.json({
//     message: "Сотрудник успешно добавлен",
//   });
// } else {
//   return res.status(400).json({
//     message: "Ошибка при добавлении сотрудника",
//   });
// }

// const isValidPassword = await bcrypt.compare(
//   req.body.password,
//   logistician._doc.passwordHash,
// );
//
//   // Если ввел не правильный пароль
// if (!isValidPassword) {
//   return res.status(404).json({ message: "Не верный логин или пароль" });
// }
