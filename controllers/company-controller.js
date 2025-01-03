import CompanyModel from "../models/company.js";
import LogisticianModel from "../models/logistician.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { CorporateBookingModel } from "../models/booking.js";

export const company = {
  // company-employee
  registerCompany: async (req, res) => {
    try {
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
          corporateBooking: [],
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
        corporateBooking: [],
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
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Ошибка при создании компании",
      });
    }
  },
  login: async (req, res) => {
    try {
      // Ищем существует ли компания с таким именем
      const existingCompany = await CompanyModel.findOne({
        nameCompany: req.body.nameCompany,
      })
        .populate({
          path: "employees.userData", // Указываем поле, которое хотим заполнить
        })
        // .populate({
        //   path: "corporateBooking.corporateBookingData",
        //   populate: {
        //     path: "manager",
        //   },
        // })
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
        LogisticianDto: existingEmmailLogisticianInCompany,
        companyDto: existingCompany,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Ошибка при входе в компанию",
      });
    }
  },
  registerLogisticianInCompany: async (req, res) => {
    try {
      const logisticianCompany = await CompanyModel.findOne({
        _id: req.token._idCompany,
      })
        .populate("employees.userData")
        .exec();
      // Если компания не существует
      if (!logisticianCompany) {
        return res.status(404).json({
          message: "Такой компании не существует",
        });
      }

      // Есть ли уже сотрудник с такой почтой
      const existingLogicyicianWithThisEmail =
        logisticianCompany.employees.find(
          (employee) => employee.userData.email === req.body.email,
        );
      // Если нашел сотрудника с такой почтой
      if (existingLogicyicianWithThisEmail) {
        return res.status(400).json({
          message: "Сотрудник с такой почтой уже сущесвтует в вашей компании",
        });
      }

      //

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
        // Возможно тут ошибка
        logisticianCompany.employees = [
          ...logisticianCompany.employees,
          newEmployee,
        ];
        await logisticianCompany.save();

        return res.json({
          message: "Пользователь зарегистрирован и добавлен",
          logistician,
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

      // logisticianCompany.employees.push(newEmployee);
      logisticianCompany.employees = [
        ...logisticianCompany.employees,
        newEmployee,
      ];
      await logisticianCompany.save();

      res.json({
        message: "Сотрудник успешно добавлен",
        logisticianCompany,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Ошибак при регистрации сотрудника",
      });
    }
  },
  removeLogisticianFromCompany: async (req, res) => {
    try {
      const rolesIsLogistician = req.token.rolesLogistician;
      // id берем из внутреней вложенности
      const logisticianId = req.params.id;

      // проверим, чтобы ген директор не удалял сам себя
      // достаем из обшей модели сотрудника
      const logisticianFromModelById =
        await LogisticianModel.findById(logisticianId);
      // Если его нет в общей базе
      if (!logisticianFromModelById) {
        return res.status(400).json({
          message: "Сотрудник не найден в общей базе пользователей",
        });
      }
      // проверка на удаление ген директора
      if (logisticianFromModelById.roles.includes("general_director")) {
        return res.status(400).json({
          message: "Ген директор не должен удалять сам себя",
        });
      }
      // если сотрудник существует и ген директор не пытается удалить сам себя
      // найдем объект сотрудника в компании
      const companyId = req.token._idCompany;
      const companyWhereIsLogistician = await CompanyModel.findById(companyId);

      // нужно проверить, не удаляет ли ген Директор сотрудника, которого нет в компании, но есть в общей базе

      const isExistingLogicticianInCompany =
        companyWhereIsLogistician.employees.find(
          (employee) => employee.userData.toString() === logisticianId,
        );
      if (!isExistingLogicticianInCompany) {
        return res.status(400).json({
          message:
            "Вы не можете удалить сотрудника, которого нет в вашей компании",
        });
      }

      // фильтруем массив сотрудников, и удаляем нужного сотрудника
      companyWhereIsLogistician.employees =
        companyWhereIsLogistician.employees.filter(
          (logistician) => logistician.userData.toString() !== logisticianId,
        );
      // сохраняем измененный массив
      await companyWhereIsLogistician.save();

      // находим и удаляем сотрудника из общей модели
      const removeLogistician =
        await LogisticianModel.findByIdAndDelete(logisticianId);
      if (!removeLogistician) {
        return res.status(404).json({
          message: "Не смогли найти и удалить сотрудника из общей базы",
        });
      }

      res.json({
        message: "Сотрудник успешно удален из компании и общей базы",
      });
    } catch (error) {
      res.status(500).json({
        message: "Ошибка при удалении сотрудника",
      });
    }
  },
  toggleLogisticianRolesFromCompany: async (req, res) => {
    try {
      const employeeId = req.params.id;
      const companyId = req.token._idCompany;
      const company = await CompanyModel.findById(companyId);
      const employeeForChangeRole = company.employees.find(
        (employee) => employee.userData.toString() === employeeId,
      );
      if (!employeeForChangeRole) {
        return res.status(404).json({
          message: "Сотрудник не найден",
        });
      }

      // Проверка, чтобы генДиректор не мог поменять роль
      if (employeeForChangeRole.corporateRoles.includes("general_director")) {
        return res.status(400).json({
          message: "Ген Диектор не должен менять себе роль(",
        });
      }
      // Найти пользователя в компании, сохранить
      // Удалить из компании
      // Изменить и сохранить в компанию

      const newDataForLagistician = {
        additionalInfo: employeeForChangeRole.additionalInfo,
        userData: employeeForChangeRole.userData,
        corporatePasswordHash: employeeForChangeRole.corporatePasswordHash,
        corporateRoles: req.body.roles,
        _id: employeeForChangeRole._id,
      };
      company.employees = company.employees.filter(
        (employee) => employee.userData.toString() !== employeeId,
      );
      await company.save();
      company.employees = [...company.employees, newDataForLagistician];
      await company.save();

      res.json({
        message: "Роль сотрудника обновлена",
      });
    } catch (error) {
      res.status(500).json({
        message: "Ошибка при изменении роли сотрудника",
      });
    }
  },
  getAllEmployees: async (req, res) => {
    try {
      const companyId = req.token._idCompany;
      const company = await CompanyModel.findById(companyId).populate({
        path: "employees.userData",
      });

      res.json(company.employees);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Ошибка при получении сотрудников",
      });
    }
  },
  // flight
  getFlightForCorporateBooking: async (req, res) => {
    try {
      const bookingId = req.params.bookingId;
      const flightId = req.params.flightId;
      const companyId = req.token._idCompany;
      const company = await CompanyModel.findById(companyId);

      let requiredCorporateBooking = company.corporateBooking.find(
        (booking) => booking.corporateBookingData.toString() === bookingId,
      );
      if (!requiredCorporateBooking) {
        res.status(404).json({
          message: "Заявка не найдена",
        });
      }

      // ищем в заявке нужный нам рейс, который нам нужен
      let requiredFlight = requiredCorporateBooking.flight.find(
        (flight) => flight._id.toString() === flightId,
      );
      if (!requiredFlight) {
        res.status(404).json({ message: "Нужный вам рейс не найден" });
      }

      res.json({
        message: "Рейс успешно получен",
        requiredFlight,
      });
    } catch (err) {}
  },
  createFlightForCorporateBooking: async (req, res) => {
    try {
      // TODO: перепиши на mongoose метод
      const corporateBookingId = req.params.id;
      const companyId = req.token._idCompany;
      const dispatcherId = req.token._idLogistician;

      const company = await CompanyModel.findById(companyId);

      // ищем заявку, куда хотим поставить машину на рейс
      const corporateBooking = company.corporateBooking.find(
        (booking) =>
          booking.corporateBookingData.toString() === corporateBookingId,
      );
      // если не нашел заявку
      if (!corporateBooking) {
        res.status(404).json({
          message: "Корпоративная заявка не найдена",
        });
      }

      // добавляем в заявку рейс
      corporateBooking.flight.push({
        organization: req.body.organization,
        cars: req.body.cars,
        dispatcher: dispatcherId,
      });

      // // удаляем заявку из компании, в которую хотим добавить рейс
      // company.corporateBooking = company.corporateBooking.filter(
      //   (booking) =>
      //     booking.corporateBookingData.toString() === corporateBookingId,
      // );
      // company.corporateBooking =
      //   company.corporateBooking.push(corporateBooking);
      await company.save();

      res.json({
        message: "Рейс успешно поставлен",
        // corporateBooking,
        company,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Ошибка при создании рейса",
      });
    }
  },
  toggleFlightCorporateBooking: async (req, res) => {
    try {
      const bookingId = req.params.bookingId;
      const flightId = req.params.flightId;
      const companyId = req.token._idCompany;
      const logisticianId = req.token._idLogistician;
      const company = await CompanyModel.findById(companyId);

      let requiredCorporateBooking = company.corporateBooking.find(
        (booking) => booking.corporateBookingData.toString() === bookingId,
      );
      if (!requiredCorporateBooking) {
        res.status(404).json({
          message: "Заявка не найдена",
        });
      }

      // ищем в заявке нужный нам рейс, который хотим изменить
      let requiredFlight = requiredCorporateBooking.flight.find(
        (flight) => flight._id.toString() === flightId,
      );
      if (!requiredFlight) {
        res.status(404).json({ message: "Нужный вам рейс не найден" });
      }

      // удалим рейс из заявки
      requiredCorporateBooking.flight = requiredCorporateBooking.flight.filter(
        (flight) => flight._id.toString() !== flightId,
      );
      // добавляем новую
      requiredCorporateBooking.flight.push({
        _id: requiredFlight._id,
        cars: req.body.cars,
        organization: req.body.organization,
        dispatcher: logisticianId,
      });

      await company.save();

      res.json({
        message: "Данные рейса обновлены",
        // requiredCorporateBooking,
        company,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Не получилось изменить рейс по заявке",
      });
    }
  },
  removeFlightCorporateBooking: async (req, res) => {
    try {
      const bookingId = req.params.bookingId;
      const flightId = req.params.flightId;
      const companyId = req.token._idCompany;
      const company = await CompanyModel.findById(companyId);

      let requiredCorporateBooking = company.corporateBooking.find(
        (booking) => booking.corporateBookingData.toString() === bookingId,
      );
      if (!requiredCorporateBooking) {
        res.status(404).json({
          message: "Заявка не найдена",
        });
      }

      requiredCorporateBooking.flight = requiredCorporateBooking.flight.filter(
        (flight) => flight._id.toString() !== flightId,
      );

      await company.save();

      res.json({
        message: "Удаление рейса прошло успешно",
        // requiredCorporateBooking,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Не получилось удалить рейс",
      });
    }
  },
  // corporate-booking
  createCorporateBooking: async (req, res) => {
    try {
      const doc = new CorporateBookingModel({
        generalInformation: {
          relevance: req.body.generalInformation.relevance,
          cargoName: req.body.generalInformation.cargoName,
          cargoAmount: req.body.generalInformation?.cargoAmount ?? null,
          icon: req.body.generalInformation.icon,
        },
        location: {
          loadingLocation: req.body.location.loadingLocation,
          loadingLocationDate: req.body.location?.loadingLocationDate ?? null,
          unloadingLocation: req.body.location.unloadingLocation,
          distance: req.body.location.distance,
        },
        terms: {
          price: req.body.terms.price,
          paymentMethod: req.body.terms.paymentMethod,
          advancePercentage: req.body.terms?.advancePercentage ?? null,
          loadingType: req.body.terms.loadingType,
        },
        requiredTransport: {
          carType: req.body.requiredTransport.carType,
          carTypeUnLoading: req.body.requiredTransport.carTypeUnLoading,
          carHeightLimit: req.body.requiredTransport?.carHeightLimit ?? null,
          carUsage: {
            count: req.body.requiredTransport.carUsage?.count ?? null,
            carPeriod: req.body.requiredTransport.carUsage?.carPeriod ?? null,
          },
        },
        additionalInfo: req.body?.additionalInfo ?? null,
        manager: req.token._idLogistician,
      });

      const booking = await doc.save();

      const existingCompany = await CompanyModel.findById(req.token._idCompany);
      if (!existingCompany) {
        return res.status(404).json({
          message: "Такой компании не существует",
        });
      }

      const corporateBooking = {
        corporateBookingData: booking._id,
      };

      existingCompany.corporateBooking.push(corporateBooking);
      await existingCompany.save();

      res.json({
        booking,
        message: "Заявка успешно создана",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Ошибка при создании booking" });
    }
  },
  getAllCorporateBooking: async (req, res) => {
    try {
      const existingCompany = await CompanyModel.findById(req.token._idCompany)
        .populate({
          path: "corporateBooking.corporateBookingData",
          populate: {
            path: "manager",
          },
        })
        .populate({
          path: "corporateBooking.flight",
          populate: {
            path: "dispatcher",
          },
        })
        .exec();

      // .populate([
      //       { path: 'followers.users' },
      //       { path: 'arts.items' }
      //     ]).populate('subscriptions.users');

      if (!existingCompany) {
        res.sttaus(404).json({
          message: "Компания не существует",
        });
      }
      res.json(existingCompany.corporateBooking);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "Не удалось получить корпоративные заявки" });
    }
  },
  getOneCorporateBooking: async (req, res) => {
    try {
      // id заявки из общей модели "внутренний id"
      const corporateBookingId = req.params.id;

      const existingCompany = await CompanyModel.findById(req.token._idCompany)
        .populate("corporateBooking.corporateBookingData")
        .exec();

      if (!existingCompany) {
        res.sttaus(404).json({
          message: "Компания не существует",
        });
      }
      const oneCorporateBooking = existingCompany.corporateBooking.find(
        (booking) => booking.corporateBookingData.id === corporateBookingId,
      );

      res.json(oneCorporateBooking);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: "Не удалось получить корпоративные заявки" });
    }
  },
  removeCorporateBooking: async (req, res) => {
    try {
      // id заявки из общей модели "внутренний id"
      const corporateBookingId = req.params.id;
      // существует ли заявка в общей модели
      const existingCorporateBooking =
        await CorporateBookingModel.findById(corporateBookingId);
      if (!existingCorporateBooking) {
        return res.status(404).json({
          message: "Такой корпаротивной заявки не существует",
        });
      }

      // найдем компанию и заявку внутри нее
      const existingCorporateBookingInCompany = await CompanyModel.findById(
        req.token._idCompany,
      );
      // отсортируем массив заявок в компании по внутренемму, тем самым удалим ее
      existingCorporateBookingInCompany.corporateBooking =
        existingCorporateBookingInCompany.corporateBooking.filter(
          (corporateBooking) =>
            corporateBooking.corporateBookingData.toString() !==
            corporateBookingId,
        );
      // сохраняем изменненую компанию
      await existingCorporateBookingInCompany.save();

      // удаляем корпаративную заявку из общей коллекции
      const removeCorporateBooking =
        await CorporateBookingModel.findByIdAndDelete(corporateBookingId);

      // res.json({ sortByOneCorporateBooking, corporateBookingId });
      res.json({
        message: "Копоративная заявка удалена",
        removeCorporateBooking,
      });
    } catch (error) {
      res.status(500).json({
        message: "Не удалось удалить корпоративную заявку",
      });
    }
  },
  toggleCorporateBooking: async (req, res) => {
    try {
      // id заявки из общей модели "внутренний id"
      const corporateBookingId = req.params.id;
      const updatedCorporateBooking =
        await CorporateBookingModel.findByIdAndUpdate(
          corporateBookingId,
          {
            generalInformation: {
              relevance: req.body.generalInformation.relevance,
              cargoName: req.body.generalInformation.cargoName,
              cargoAmount: req.body.generalInformation?.cargoAmount ?? null,
              icon: req.body.generalInformation.icon,
            },
            location: {
              loadingLocation: req.body.location.loadingLocation,
              loadingLocationDate:
                req.body.location?.loadingLocationDate ?? null,
              unloadingLocation: req.body.location.unloadingLocation,
              distance: req.body.location.distance,
            },
            terms: {
              price: req.body.terms.price,
              paymentMethod: req.body.terms.paymentMethod,
              advancePercentage: req.body.terms?.advancePercentage ?? null,
              loadingType: req.body.terms.loadingType,
            },
            requiredTransport: {
              carType: req.body.requiredTransport.carType,
              carTypeUnLoading: req.body.requiredTransport.carTypeUnLoading,
              carHeightLimit:
                req.body.requiredTransport?.carHeightLimit ?? null,
              carUsage: {
                count: req.body.requiredTransport.carUsage?.count ?? null,
                carPeriod:
                  req.body.requiredTransport.carUsage?.carPeriod ?? null,
              },
            },
            additionalInfo: req.body?.additionalInfo ?? null,
            manager: req.token._idLogistician,
          },
          { new: true }, // возвращает обновленный объект
        );

      res.json({ updatedCorporateBooking });
    } catch (error) {
      res.status(500).json({
        message: "Не удалось изменить корпаротивную заявку",
      });
    }
  },
  toggleCorporateBookingStatus: async (req, res) => {
    try {
      const corporateBookingId = req.params.id;
      const newStatus = req.body.status;

      const updateCorporateBooking =
        await CorporateBookingModel.findByIdAndUpdate(
          corporateBookingId,
          {
            $set: { status: newStatus },
          },
          { new: true },
        );

      if (!updateCorporateBooking) {
        return res.status(400).json({
          message: "Не удалось обновить статус заявки",
        });
      }
      return res.json({
        updateCorporateBooking,
      });
    } catch (error) {
      res.status(500).json({
        message: "Ошибка при изменении статуса заявки",
      });
    }
  },
};

// _idCompany: company._id,
// _idLogistician: logistician._id,
// rolesLogistician: ["general_director"],

// Выкладывание заявки на общий сайт
// const bookingId = req.params.bookingId;
// const booking = await CorporateBookingModel.findById(bookingId);

// if (!booking) {
//   return res.status(404).json({ message: "Заявка не найдена" });
// }

// // Проверяем, есть ли право на публикацию
// if (booking.isPublished) {
//   return res.status(400).json({ message: "Заявка уже опубликована" });
// }

// // Публикуем заявку
// booking.isPublished = true;
// await booking.save();
