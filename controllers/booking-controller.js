import { validationResult } from "express-validator";
import BookingModel from "../models/booking.js";

export const booking = {
  create: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    try {
      const doc = new BookingModel({
        generalInformation: {
          relevance: req.body.generalInformation?.relevance,
          cargoName: req.body.generalInformation?.cargoName,
          cargoAmount: req.body.generalInformation?.cargoAmount,
          icon: req.body.generalInformation?.icon,
        },
        location: {
          loadingLocation: req.body.location?.loadingLocation,
          loadingLocationDate: req.body.location?.loadingLocationDate,
          unloadingLocation: req.body.location?.unloadingLocation,
          distance: req.body.location?.distance,
        },
        terms: {
          price: req.body.terms?.price,
          paymentMethod: req.body.terms?.paymentMethod,
          advance: req.body.terms?.advance
            ? {
                percentage: req.body.terms.advance?.percentage,
                period: req.body.terms.advance?.period,
              }
            : undefined,
          loadingType: req.body.terms?.loadingType,
          truckType: req.body.terms?.truckType,
        },
        requiredTransport: req.body.requiredTransport
          ? {
              carType: req.body.requiredTransport.carType,
              carTypeUnLoading: req.body.requiredTransport.carTypeUnLoading,
              carHeightLimit: req.body.requiredTransport.carHeightLimit,
              carUsage: req.body.requiredTransport.carUsage
                ? {
                    count: req.body.requiredTransport.carUsage.count,
                    carPeriod: req.body.requiredTransport.carUsage.carPeriod,
                  }
                : undefined,
            }
          : undefined,
        additionalInfo: req.body.additionalInfo,
        manager: req.userId, // Поле обязательное
      });

      const booking = await doc.save();
      res.json(booking);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Ошибка при создании booking" });
    }
  },
  getAll: async (req, res) => {
    try {
      const bookings = await BookingModel.find().populate("manager").exec();
      // или ["", ""]
      res.json(bookings);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Не удалось получить bookings" });
    }
  },
  getOne: async (req, res) => {
    try {
      const bookingId = req.params.id;
      const booking = await BookingModel.findById(bookingId)
        .populate("manager")
        .exec();
      // или ["", ""]
      res.json(booking);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Не удалось получить booking" });
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
  toggle: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    try {
      const bookingId = req.params.id;

      // Проверяем, существует ли документ
      const existingBooking = await BookingModel.findById(bookingId);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking не найден" });
      }

      // Обновляем документ
      const updatedBooking = await BookingModel.findByIdAndUpdate(
        bookingId,
        {
          generalInformation: {
            relevance: req.body.generalInformation?.relevance,
            cargoName: req.body.generalInformation?.cargoName,
            cargoAmount: req.body.generalInformation?.cargoAmount,
            icon: req.body.generalInformation?.icon,
          },
          location: {
            loadingLocation: req.body.location?.loadingLocation,
            loadingLocationDate: req.body.location?.loadingLocationDate,
            unloadingLocation: req.body.location?.unloadingLocation,
            distance: req.body.location?.distance,
          },
          terms: {
            price: req.body.terms?.price,
            paymentMethod: req.body.terms?.paymentMethod,
            advance: req.body.terms?.advance
              ? {
                  percentage: req.body.terms.advance?.percentage,
                  period: req.body.terms.advance?.period,
                }
              : undefined,
            loadingType: req.body.terms?.loadingType,
            truckType: req.body.terms?.truckType,
          },
          requiredTransport: req.body.requiredTransport
            ? {
                carType: req.body.requiredTransport.carType,
                carTypeUnLoading: req.body.requiredTransport.carTypeUnLoading,
                carHeightLimit: req.body.requiredTransport.carHeightLimit,
                carUsage: req.body.requiredTransport.carUsage
                  ? {
                      count: req.body.requiredTransport.carUsage.count,
                      carPeriod: req.body.requiredTransport.carUsage.carPeriod,
                    }
                  : undefined,
              }
            : undefined,
          additionalInfo: req.body.additionalInfo,
          manager: req.userId, // Поле обязательное
        },
        { new: true }, // возвращает обновленный объект
      );

      res.json(updatedBooking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка при обновлении booking" });
    }
  },
};

// BookingModel.findOneAndUpdate({ _id: id }, {...}, returnDocument: 'after')
// там есть дополнение с обработкой ошибки, на айпаде скрин
