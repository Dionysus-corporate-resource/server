import User from "../models/user.model.js";
import schedule from "node-schedule";

export const checkExpiredSubscriptions = async () => {
  try {
    console.log("🔖 проверка подписок");
    const now = new Date();

    await User.updateMany(
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
            "activeSubscriptions.showContactSubscription.expiresAt": {
              $lt: now,
            },
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

    console.log("Проверка подписок завершена:", now.toISOString());
  } catch (error) {
    console.error("❌ Ошибка при проверке подписок:", error.message);
  }
};

export const startSubscriptionCron = () => {
  // Запускаем сразу при старте
  checkExpiredSubscriptions();

  // Затем каждые 24 часа
  // setInterval(checkExpiredSubscriptions, 24 * 60 * 60 * 1000);
  schedule.scheduleJob("0 */24 * * *", () => {
    checkExpiredSubscriptions();
  });
};
