import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
//
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
} from "./validations/authPublic.js";
import { authPublicSite } from "./controllers/user-controller.js";
import { booking } from "./controllers/booking-controller.js";
import { bookingValidator } from "./validations/booking.js";
import { check } from "./utils/checkAuth.js";
import { proposalsDevelopment } from "./controllers/proposals-development-controller.js";
import { proposalsDevelopmentValidator } from "./validations/proposals-development.js";
import { company } from "./controllers/company-controller.js";
import Logistician from "./models/logistician.js";
import { BookingModel } from "./models/booking.js";

// curl -X POST https://api.yookassa.ru/v3/webhooks \
// -u 1023852:test_NqZIdGsCluEi5JcbU8QZU1mXkxJxLEACueQRJ7sOi80 \
// -H "Idempotence-Key: 550e8400-e29b-41d4-a716-arq45345345" \
// -H "Content-Type: application/json" \
// -d '{
//   "event": "payment.succeeded",
//   "url": "https://server.gruzrynok.ru/api/payment-webhook"
// }'

dotenv.config();
// Загружаем переменные из .env c
const app = express();
app.use(cors());
app.use(express.json());

// DATABASE_DEVELOP_URL
// DATABASE_URL
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));
// Маршруты
app.get("/", (req, res) => {
  res.send(
    "Привет, Roma! Это твой первый сервер на Express с модулями ES6!! New Version",
  );
});

// auth
app.post("/auth/register", registerValidator, authPublicSite.register);
app.post("/auth/login", loginValidator, authPublicSite.login);
app.patch(
  "/users/profile",
  check.isAuth,
  updateProfileValidator,
  authPublicSite.updateProfile,
);
app.get("/auth/me", check.isAuth, authPublicSite.getMe);

// subscribe
app.post(
  "/api/create-payment/limit-booking",
  check.isAuth,
  async (req, res) => {
    try {
      const userId = req.userId;
      // typeSubscriprion - тип подписки limitBooking, unLimitBooking, showContact
      const { priceOneBooking, countBooking } = req.body;
      const finalyPrice = priceOneBooking * countBooking;

      const paymentData = {
        amount: {
          value: finalyPrice.toFixed(2),
          currency: "RUB",
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: `https://gruzrynok.ru/payment-success`,
          cancel_url: `https://gruzrynok.ru/payment-failed`,
        },
        description: `Вы покпаете заявки`,
        metadata: {
          userId,
          countBooking,
          typeSubscriprion: "limited",
          countMonthSubscribe: null,
        },
      };

      const response = await axios.post(
        "https://api.yookassa.ru/v3/payments",
        paymentData,
        {
          auth: {
            username: process.env.YOOKASSA_SHOP_ID,
            password: process.env.YOOKASSA_SECRET_KEY,
          },
          headers: {
            "Idempotence-Key": uuidv4(),
          },
        },
      );

      res.status(200).json({
        confirmationUrl: response.data.confirmation.confirmation_url,
      });
    } catch (error) {
      res.status(500).json({ error: "Payment creation failed" });
    }
  },
);
app.post(
  "/api/create-payment/un-limit-booking",
  check.isAuth,
  async (req, res) => {
    try {
      const gitFinalyPrice = (typeSubscriprion, countMonthSubscribe) => {
        switch (typeSubscriprion) {
          case "unLimited":
            return 3500;
          case "showContact": {
            if (countMonthSubscribe === 1) {
              return 100;
            } else if (countMonthSubscribe === 3) {
              return 250;
            } else {
              return 100;
            }
          }
          default:
        }
      };
      const userId = req.userId;
      // тип подписки unLimitBooking, showContact и на сколько покупается
      const { typeSubscriprion, countMonthSubscribe } = req.body;
      const finalyPrise = gitFinalyPrice(typeSubscriprion, countMonthSubscribe);

      const paymentData = {
        amount: {
          value: finalyPrise.toFixed(2),
          currency: "RUB",
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: `https://gruzrynok.ru/payment-success`,
          cancel_url: `https://gruzrynok.ru/payment-failed`,
        },
        description: `Покупка безлимитной подписки`,
        metadata: {
          countBooking: null,
          countMonthSubscribe,
          typeSubscriprion,
          userId,
        },
      };

      const response = await axios.post(
        "https://api.yookassa.ru/v3/payments",
        paymentData,
        {
          auth: {
            username: process.env.YOOKASSA_SHOP_ID,
            password: process.env.YOOKASSA_SECRET_KEY,
          },
          headers: {
            "Idempotence-Key": uuidv4(),
          },
        },
      );

      res.status(200).json({
        confirmationUrl: response.data.confirmation.confirmation_url,
      });
    } catch (error) {
      res.status(500).json({ error: "Payment creation failed" });
    }
  },
);

// Вебхук для обработки уведомлений
app.post("/api/payment-webhook", async (req, res) => {
  console.log("роут webhook");
  try {
    console.log("роут webhook");
    const { event, object } = req.body;
    // В зависимости от типа подписки, а скорее роута в object.metadata будет лежать разная информация
    // typeSubscriprion(limitBooking, unLimitBooking, showContact) и userId всега, а вот countBooking и countMonthSubscribe или число или null

    if (event === "payment.succeeded") {
      const { typeSubscriprion, userId, countBooking, countMonthSubscribe } =
        object.metadata;

      const user = await Logistician.findById(userId);
      if (!user) {
        console.error("Пользователь не найден");
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      console.log(
        "Запрос успешен, переменные - userId, typeSubscriprion, countBooking, countMonthSubscribe",
        userId,
        typeSubscriprion,
        countBooking,
        countMonthSubscribe,
      );

      // если запрос успешный, то меняем данные пользователя
      // Смотрим на тип подписки, и время
      if (typeSubscriprion === "limited" && countBooking) {
        console.log("Обработка limitBooking");

        const user = await Logistician.findById(userId);
        if (!user) {
          throw new Error("Пользователь не найден");
        }

        // Преобразуем значения в числа
        const currentRemainingBookings = Number(
          user.activeSubscriptions.purchasedBooking.remainingBookings,
        );
        const countBookingNumber = Number(countBooking);

        await Logistician.findByIdAndUpdate(
          userId,
          {
            $set: {
              "activeSubscriptions.purchasedBooking.allPurchasedBookings":
                currentRemainingBookings + countBookingNumber,
            },
            $inc: {
              "activeSubscriptions.purchasedBooking.remainingBookings":
                countBooking,
            },
          },
          { new: true },
        );
      } else if (typeSubscriprion === "unLimited") {
        console.log("Обработка unLimitBooking");
        // если пользователь уже покупал подписку будем плючовать время
        // Для этого нужна функция, которая проверит, если есть время
        const calculateRemainingSubscriptionTime = (subscription) => {
          if (
            !subscription?.isPurchased ||
            !subscription.expiresAt ||
            !subscription.purchasedAt
          ) {
            return 0;
          }

          const now = Date.now();
          const expiresAt = new Date(subscription.expiresAt).getTime();
          const purchasedAt = new Date(subscription.purchasedAt).getTime();

          // Если подписка еще не началась (now < purchasedAt)
          if (now < purchasedAt) {
            // const totalDuration = expiresAt - purchasedAt;
            return Math.ceil((expiresAt - purchasedAt) / (1000 * 60 * 60 * 24));
          }

          // Если подписка уже началась
          const totalDuration = expiresAt - purchasedAt;
          const timePassed = now - purchasedAt;

          const remainingMilliseconds = expiresAt - now;
          const remainingDays = Math.ceil(
            remainingMilliseconds / (1000 * 60 * 60 * 24),
          );

          return remainingDays;
        };
        const user = await Logistician.findById(userId);
        const remainingDays = calculateRemainingSubscriptionTime(
          user.activeSubscriptions.unLimitedBookingSubscription,
        );
        await Logistician.findByIdAndUpdate(
          userId,
          {
            $set: {
              "activeSubscriptions.unLimitedBookingSubscription": {
                isPurchased: true,
                purchasedAt: new Date(),
                expiresAt: new Date(
                  Date.now() + (30 + remainingDays) * 24 * 60 * 60 * 1000,
                ), // +30 дней
              },
            },
          },
          { new: true },
        );
      } else if (typeSubscriprion === "showContact" && countMonthSubscribe) {
        console.log("Обработка showContact");
        // если пользователь уже покупал подписку будем плючовать время
        // Для этого нужна функция, которая проверит, если есть время
        const calculateRemainingSubscriptionTime = (subscription) => {
          if (
            !subscription?.isPurchased ||
            !subscription.expiresAt ||
            !subscription.purchasedAt
          ) {
            return 0;
          }

          const now = Date.now();
          const expiresAt = new Date(subscription.expiresAt).getTime();
          const purchasedAt = new Date(subscription.purchasedAt).getTime();

          // Если подписка еще не началась (now < purchasedAt)
          if (now < purchasedAt) {
            // const totalDuration = expiresAt - purchasedAt;
            return Math.ceil((expiresAt - purchasedAt) / (1000 * 60 * 60 * 24));
          }

          // Если подписка уже началась
          const totalDuration = expiresAt - purchasedAt;
          const timePassed = now - purchasedAt;

          const remainingMilliseconds = expiresAt - now;
          const remainingDays = Math.ceil(
            remainingMilliseconds / (1000 * 60 * 60 * 24),
          );

          return remainingDays;
        };
        const user = await Logistician.findById(userId);
        const remainingDays = calculateRemainingSubscriptionTime(
          user.activeSubscriptions.showContactSubscription,
        );

        const millisecondsInOneMonth =
          (30 + remainingDays) * 24 * 60 * 60 * 1000; // 30 дней
        const totalMilliseconds = countMonthSubscribe * millisecondsInOneMonth;
        const expiresAt = new Date(Date.now() + totalMilliseconds);

        await Logistician.findByIdAndUpdate(
          userId,
          {
            $set: {
              "activeSubscriptions.showContactSubscription": {
                isPurchased: true,
                purchasedAt: new Date(),
                expiresAt: expiresAt,
              },
            },
          },
          { new: true },
        );
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    res.status(500).json({
      message: "Ошибка при обработке платежа",
    });
  }
});
// проверка актуальности подписок
// cron/subscriptions.ts
// доцент кафедры информационной технологии

const toggleBookingStatusInActive = async () => {
  await BookingModel.updateMany(
    { status: { $ne: "inactive" } },
    { $set: { status: "inactive" } },
  );
};

export const checkExpiredSubscriptions = async () => {
  const now = new Date();

  // Обновляем подписки, которые истекли
  await Logistician.updateMany(
    {
      $or: [
        {
          "activeSubscriptions.unLimitedBookingSubscription.isPurchased": true,
          "activeSubscriptions.unLimitedBookingSubscription.expiresAt": {
            $lt: now,
          },
        },
        {
          "activeSubscriptions.showContactSubscription.isPurchased": true,
          "activeSubscriptions.showContactSubscription.expiresAt": { $lt: now },
        },
      ],
    },
    {
      $set: {
        "activeSubscriptions.unLimitedBookingSubscription.isPurchased": false,
        "activeSubscriptions.unLimitedBookingSubscription.expiresAt": null,
        "activeSubscriptions.showContactSubscription.isPurchased": false,
        "activeSubscriptions.showContactSubscription.expiresAt": null,
      },
    },
  );

  console.log("Проверка подписок завершена:", new Date().toISOString());
};
// booking
// bookingValidator
app.post("/booking", check.isAuth, booking.create);
app.put("/booking/:id", check.isAuth, booking.update);
app.patch("/booking/:id", check.isAuth, booking.updateStatus);
app.get("/booking", booking.getAll);
app.get("/booking/:id", booking.getOne);
app.delete("/booking/:id", check.isAuth, booking.remove);
// proposalsDevelopment
// app.get("/proposals-development", check.isAuth, proposalsDevelopment.getAll);
// app.post(
//   "/proposals-development",J
//   check.isAuth,
//   proposalsDevelopmentValidator,
//   proposalsDevelopment.create,
// );
// company
// auth
// app.post("/company/register", company.registerCompany);
// app.post("/company/login", company.login);
// app.post(
//   "/company/register-employee",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director"]),
//   company.registerLogisticianInCompany,
// );
// app.delete(
//   "/company/employee/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director"]),
//   company.removeLogisticianFromCompany,
// );
// app.put(
//   "/company/employee/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director"]),
//   company.toggleLogisticianRolesFromCompany,
// );
// app.get(
//   "/company/employee",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager"]),
//   company.getAllEmployees,
// );
// // corporate-booking
// app.post(
//   "/company/booking",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager"]),
//   company.createCorporateBooking,
// );
// app.get(
//   "/company/booking",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager", "dispatcher"]),
//   company.getAllCorporateBooking,
// );
// app.get(
//   "/company/booking/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager", "dispatcher"]),
//   company.getOneCorporateBooking,
// );
// app.delete(
//   "/company/booking/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager"]),
//   company.removeCorporateBooking,
// );
// app.put(
//   "/company/booking/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager"]),
//   company.toggleCorporateBooking,
// );
// app.put(
//   "/company/booking-status/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager"]),
//   company.toggleCorporateBookingStatus,
// );
// // flight
// app.get(
//   "/company/flight/:bookingId/:flightId",
//   check.isExistingCompany,
//   check.isNeedRoles(["dispatcher", "general_director"]),
//   company.getFlightForCorporateBooking,
// );
// app.post(
//   "/company/flight/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["dispatcher", "general_director"]),
//   company.createFlightForCorporateBooking,
// );
// app.put(
//   "/company/flight/:bookingId/:flightId",
//   check.isExistingCompany,
//   check.isNeedRoles(["dispatcher", "general_director"]),
//   company.toggleFlightCorporateBooking,
// );
// app.delete(
//   "/company/flight/:bookingId/:flightId",
//   check.isExistingCompany,
//   check.isNeedRoles(["dispatcher", "general_director"]),
//   company.removeFlightCorporateBooking,
// );

// Запуск сервера
// Запуск проверки подписок каждые 24 часа
setInterval(checkExpiredSubscriptions, 24 * 60 * 60 * 1000);
// Можно также запустить проверку сразу при старте приложения
checkExpiredSubscriptions();
toggleBookingStatusInActive();

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
