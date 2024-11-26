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
        relevance: req.body.relevance,
        cargoName: req.body.cargoName,
        cargoAmount: req.body.cargoAmount,
        loadType: req.body.loadType,
        location: {
          loadingLocation: req.body.location.loadingLocation,
          unloadingLocation: req.body.location.unloadingLocation,
          distance: req.body.location.distance,
        },
        terms: {
          price: req.body.terms.price,
          paymentMethod: req.body.terms.paymentMethod,
          truckType: req.body.terms.truckType,
        },
        advance: {
          percentage: req.body.advance.percentage,
        },
        additionalInfo: req.body.additionalInfo,
        manager: req.userId,
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
};

// BookingModel.findOneAndUpdate({ _id: id }, {...}, returnDocument: 'after')
// там есть дополнение с обработкой ошибки, на айпаде скрин
