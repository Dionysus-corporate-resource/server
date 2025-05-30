import User from "../models/user.model.js";

export const checkExpiredSubscriptions = async () => {
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

  console.log("Проверка подписок завершена:", now.toISOString());
};

export const startSubscriptionCron = () => {
  // Запускаем сразу при старте
  checkExpiredSubscriptions();

  // Затем каждые 24 часа
  setInterval(checkExpiredSubscriptions, 24 * 60 * 60 * 1000);
};
