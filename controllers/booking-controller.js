import { validationResult } from "express-validator";
import { BookingModel } from "../models/booking.js";
import Logistician from "../models/logistician.js";

export const booking = {
  create: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    try {
      const userId = req.userId;
      const user = await Logistician.findById(userId)
        .populate("companyPublicData")
        .exec();

      if (!user.companyPublicData) {
        return res
          .status(400)
          .json({ message: "Не вышло прочитать данные компании" });
      }

      const doc = new BookingModel({
        status: req.body.status || "active", // можно задать значение по умолчанию
        basicInfo: {
          distance: req.body.basicInfo?.distance,
          loadingLocation: {
            name: req.body.basicInfo?.loadingLocation?.name,
            coordinates: req.body.basicInfo?.loadingLocation?.coordinates,
          },
          unLoadingLocation: req.body.basicInfo?.unLoadingLocation,
          tonnage: req.body.basicInfo?.tonnage,
          culture: req.body.basicInfo?.culture,
        },
        conditionsTransportation: {
          loadingMethod: req.body.conditionsTransportation?.loadingMethod,
          scaleCapacity: req.body.conditionsTransportation?.scaleCapacity,
          loadingDate: req.body.conditionsTransportation?.loadingDate,
        },
        detailTransportation: {
          demurrage: req.body.detailTransportation?.demurrage,
          allowedShortage: req.body.detailTransportation?.allowedShortage,
          paymentType: req.body.detailTransportation?.paymentType,
          ratePerTon: req.body.detailTransportation?.ratePerTon,
          paymentDeadline: req.body.detailTransportation?.paymentDeadline,
        },
        additionalConditions: {
          additionalInformation:
            req.body.additionalConditions?.additionalInformation,
          contacts: req.body.additionalConditions?.contacts || [],
        },
        user: req.userId, // Используем ID текущего пользователя
        companyPublicData: user.companyPublicData._id,
      });

      const updatedUser = await Logistician.findByIdAndUpdate(
        userId,
        {
          $inc: {
            "activeSubscriptions.purchasedBooking.remainingBookings": -1,
          },
        },
        { new: true }, // Возвращает обновленный документ
      );

      if (!updatedUser) {
        return res.status(400).json({ message: "Пользователь не найден" });
      }

      const booking = await doc.save();
      res.json(booking);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Ошибка при создании booking" });
    }
  },

  getAll: async (req, res) => {
    try {
      const bookings = await BookingModel.find()
        .populate("user")
        .populate("companyPublicData")
        .exec();

      // После этого, заполняем поле user.companyPublicData
      // const populatedBookings = await Promise.all(
      //   bookings.map(async (booking) => {
      //     if (booking.user && booking.user.companyPublicData) {
      //       await booking.populate("user.companyPublicData");
      //     }
      //     return booking;
      //   }),
      // );
      res.json(bookings);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Не удалось получить bookings" });
    }
  },
  getOne: async (req, res) => {
    try {
      // Находим бронирование и заполняем поле `user`
      const booking = await BookingModel.findById(req.params.id)
        .populate("user")
        .populate("companyPublicData")
        .exec();

      if (!booking) {
        return res.status(404).json({ message: "Бронирование не найдено" });
      }

      // Увеличиваем свойство `view` на 1
      booking.view += 1;

      // Сохраняем изменения в базе данных
      await booking.save();

      // Если у пользователя есть companyPublicData, заполняем его
      // if (booking.user && booking.user.companyPublicData) {
      //   await booking.populate({
      //     path: "user.companyPublicData",
      //     model: "CompanyPublic",
      //   });
      // }

      // Возвращаем обновлённый объект
      res.json(booking);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Не удалось получить booking" });
    }
  },

  update: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    try {
      const bookingId = req.params.id;

      const userId = req.userId;
      const user = await Logistician.findById(userId)
        .populate("companyPublicData")
        .exec();
      if (!user.companyPublicData) {
        return res
          .status(400)
          .json({ message: "Не вышло прочитать данные компании" });
      }

      // Проверяем, существует ли документ
      const existingBooking = await BookingModel.findById(bookingId);
      if (!existingBooking) {
        return res.status(404).json({ message: "Заявка не найдена" });
      }

      // Обновляем документ
      const updatedBooking = await BookingModel.findByIdAndUpdate(
        bookingId,
        {
          status: req.body.status || "active", // можно задать значение по умолчанию
          basicInfo: {
            distance: req.body.basicInfo?.distance,
            loadingLocation: {
              name: req.body.basicInfo?.loadingLocation?.name,
              coordinates: req.body.basicInfo?.loadingLocation?.coordinates,
            },
            unLoadingLocation: req.body.basicInfo?.unLoadingLocation,
            tonnage: req.body.basicInfo?.tonnage,
            culture: req.body.basicInfo?.culture,
          },
          conditionsTransportation: {
            loadingMethod: req.body.conditionsTransportation?.loadingMethod,
            scaleCapacity: req.body.conditionsTransportation?.scaleCapacity,
            loadingDate: req.body.conditionsTransportation?.loadingDate,
          },
          detailTransportation: {
            demurrage: req.body.detailTransportation?.demurrage,
            allowedShortage: req.body.detailTransportation?.allowedShortage,
            paymentType: req.body.detailTransportation?.paymentType,
            ratePerTon: req.body.detailTransportation?.ratePerTon,
            paymentDeadline: req.body.detailTransportation?.paymentDeadline,
          },
          additionalConditions: {
            additionalInformation:
              req.body.additionalConditions?.additionalInformation,
            contacts: req.body.additionalConditions?.contacts || [],
          },
          // user: req.userId,
          companyPublicData: user.companyPublicData._id,
        },
        { new: true }, // возвращает обновленный объект
      );

      res.json(updatedBooking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка при обновлении заявки" });
    }
  },
  updateStatus: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    try {
      const bookingId = req.params.id;

      // Проверяем, существует ли документ
      const existingBooking = await BookingModel.findById(bookingId);
      if (!existingBooking) {
        return res.status(404).json({ message: "Заявка не найдена" });
      }

      // Обновляем документ
      const updatedBooking = await BookingModel.findByIdAndUpdate(
        bookingId,
        {
          status: req.body.status || "active", // можно задать значение по умолчанию
        },
        { new: true }, // возвращает обновленный объект
      );

      res.json(updatedBooking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка при обновлении заявки" });
    }
  },
  remove: async (req, res) => {
    try {
      const bookingId = req.params.id;
      const booking = await BookingModel.findOneAndDelete({ _id: bookingId });

      if (!booking) {
        // Если документ не найден
        return res.status(404).json({
          message: "Не удалось найти booking",
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Не удалось получить booking" });
    }
  },
};

// BookingModel.findOneAndUpdate({ _id: id }, {...}, returnDocument: 'after')
// там есть дополнение с обработкой ошибки, на айпаде скрин
