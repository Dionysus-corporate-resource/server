import express from "express";
import checkAuth from "../middlewares/auth.middleware.js";
import User from "../models/user.model.js";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/limit-booking", checkAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { priceOneBooking, countBooking } = req.body;
    const finalyPrice = priceOneBooking * countBooking;

    console.log(process.env.YOOKASSA_SHOP_ID, process.env.YOOKASSA_SECRET_KEY);

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
      description: `Покупка заявок в количестве ${countBooking} шт`,
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
});

router.post("/un-limit-booking", checkAuth, async (req, res) => {
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
          return 100;
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
      description: `Оформление безлимитной подписки`,
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
});

// Вебхук для обработки уведомлений
router.post("/webhook", async (req, res) => {
  console.log("роут webhook");
  try {
    console.log("роут webhook");
    const { event, object } = req.body;
    // В зависимости от типа подписки, а скорее роута в object.metadata будет лежать разная информация
    // typeSubscriprion(limitBooking, unLimitBooking, showContact) и userId всега, а вот countBooking и countMonthSubscribe или число или null

    if (event === "payment.succeeded") {
      const { typeSubscriprion, userId, countBooking, countMonthSubscribe } =
        object.metadata;

      const user = await User.findById(userId);
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

        const user = await User.findById(userId);
        if (!user) {
          throw new Error("Пользователь не найден");
        }

        // Преобразуем значения в числа
        const currentRemainingBookings = Number(
          user.activeSubscriptions.purchasedBooking.remainingBookings,
        );
        const countBookingNumber = Number(countBooking);

        await User.findByIdAndUpdate(
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
        // если пользователь уже покупал подписку будем плюсовать время
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

        const user = await User.findById(userId);
        const remainingDays = calculateRemainingSubscriptionTime(
          user.activeSubscriptions.unLimitedBookingSubscription,
        );
        await User.findByIdAndUpdate(
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
        const user = await User.findById(userId);
        const remainingDays = calculateRemainingSubscriptionTime(
          user.activeSubscriptions.showContactSubscription,
        );

        const millisecondsInOneMonth =
          (30 + remainingDays) * 24 * 60 * 60 * 1000; // 30 дней
        const totalMilliseconds = countMonthSubscribe * millisecondsInOneMonth;
        const expiresAt = new Date(Date.now() + totalMilliseconds);

        await User.findByIdAndUpdate(
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

export default router;
