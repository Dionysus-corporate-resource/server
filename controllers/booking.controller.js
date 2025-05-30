import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";

export const bookingControllers = {
  getAll: async (req, res) => {
    try {
      const bookings = await Booking.find();

      res.status(200).json(bookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при получении заявок" });
    }
  },
  getUserBooking: async (req, res) => {
    try {
      const userId = req.userId;
      const userBookings = await Booking.find({ user: userId });

      res.status(200).json(userBookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при получении заявок" });
    }
  },
  getByIdBooking: async (req, res) => {
    try {
      const bookingId = req.params.bookingId;
      const booking = await Booking.findById(bookingId);

      booking.view += 1;
      await booking.save();

      res.status(200).json(booking);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при получении заявок" });
    }
  },
  createShortBooking: async (req, res) => {
    try {
      const body = req.body;
      const userId = req.userId;

      const user = await User.findById(userId);

      // Проверяем, если у пользователя нет доступных заявок и нет подписки на безлимит
      if (
        user.activeSubscriptions.purchasedBooking.remainingBookings <= 0 &&
        !user.activeSubscriptions.unLimitedBookingSubscription.isPurchased
      ) {
        return res.status(400).json({
          message: "У вас кончились заявки и нет безлимитной подписки",
        });
      }

      const docBooking = await Booking({
        status: "active",
        basicInfo: body.basicInfo,
        additionalConditions: null,
        user: userId,
      });

      const saveBooking = await docBooking.save();

      // Если у него безлимит, не отнимаем заявки, даже если есть, просто выходим
      if (user.activeSubscriptions.unLimitedBookingSubscription.isPurchased) {
        return res.status(200).json({ message: "Заявка создана" });
      }

      // Уменьшаем remainingBookings только после успешного сохранения заявки
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            "activeSubscriptions.purchasedBooking.remainingBookings": -1,
          },
        },
        { new: true },
      );

      if (!updatedUser) {
        return res.status(400).json({ message: "Пользователь не найден" });
      }

      res.status(200).json({ message: "Короткая заявка создана", saveBooking });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при создании" });
    }
  },
  createDetailBooking: async (req, res) => {
    try {
      const body = req.body;
      const userId = req.userId;

      const user = await User.findById(userId);

      // Проверяем, если у пользователя нет доступных заявок и нет подписки на безлимит
      if (
        user.activeSubscriptions.purchasedBooking.remainingBookings <= 0 &&
        !user.activeSubscriptions.unLimitedBookingSubscription.isPurchased
      ) {
        return res.status(400).json({
          message: "У вас кончились заявки и нет безлимитной подписки",
        });
      }

      const docBooking = await Booking({
        status: "active",
        basicInfo: body.basicInfo,
        additionalConditions: body.additionalConditions,
        user: userId,
      });

      const saveBooking = await docBooking.save();

      // Если у него безлимит, не отнимаем заявки, даже если есть, просто выходим
      if (user.activeSubscriptions.unLimitedBookingSubscription.isPurchased) {
        return res.status(200).json({ message: "Заявка создана" });
      }

      // Уменьшаем remainingBookings только после успешного сохранения заявки
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            "activeSubscriptions.purchasedBooking.remainingBookings": -1,
          },
        },
        { new: true },
      );

      if (!updatedUser) {
        return res.status(400).json({ message: "Пользователь не найден" });
      }

      res
        .status(200)
        .json({ message: "Детальная заявка создана", saveBooking });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при создании" });
    }
  },
  editShortBooking: async (req, res) => {
    try {
      const body = req.body;
      const bookingId = req.params.bookingId;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Заявка не найдена" });
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { $set: body },
        { new: true },
      );

      res.status(200).json({
        message: "Заявка успешно изменена",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при редактировании" });
    }
  },
  editDetailBooking: async (req, res) => {
    try {
      const body = req.body;
      const bookingId = req.params.bookingId;

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Заявка не найдена" });
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { $set: body },
        { new: true },
      );

      res.status(200).json({
        message: "Заявка успешно изменена",
        booking: updatedBooking,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка при редактировании" });
    }
  },
  updateStatusBooking: async (req, res) => {
    try {
      const bookingId = req.params.bookingId;

      const existingBooking = await Booking.findById(bookingId);
      if (!existingBooking) {
        return res.status(404).json({ message: "Заявка не найдена" });
      }

      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: req.body.status,
        },
        { new: true },
      );

      res.json(updatedBooking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка при обновлении заявки" });
    }
  },
  removeBooking: async (req, res) => {
    try {
      const bookingId = req.params.bookingId;
      const booking = await Booking.findOneAndDelete({ _id: bookingId });

      if (!booking) {
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
