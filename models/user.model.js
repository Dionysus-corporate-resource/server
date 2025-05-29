import mongoose from "mongoose";

const PurchasedBookingSchema = new mongoose.Schema({
  allPurchasedBookings: { type: Number, default: 0 },
  remainingBookings: { type: Number, default: 0 },
});

const UnLimitedBookingSubscriptionSchema = new mongoose.Schema({
  isPurchased: { type: Boolean, default: false },
  purchasedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
});

const ShowContactSubscriptionSchema = new mongoose.Schema({
  isPurchased: { type: Boolean, default: false },
  purchasedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
});

const SubscriptionSchema = new mongoose.Schema({
  purchasedBooking: PurchasedBookingSchema,
  unLimitedBookingSubscription: UnLimitedBookingSubscriptionSchema,
  showContactSubscription: ShowContactSubscriptionSchema,
});

const UserSchema = new mongoose.Schema(
  {
    userName: { type: String, require: false, default: "" },
    email: { type: String, require: true, unique: true },
    passwordHash: { type: String, require: true },
    phone: { type: String, require: true },
    companyName: { type: String, require: true, nullable: true },
    roles: {
      type: String,
      enum: ["customer", "driver"],
      required: true,
    },
    permissions: {
      type: [String],
      enum: ["developer", "admin", "moderator"],
      default: [],
      required: false,
    },
    activeSubscriptions: SubscriptionSchema,
  },
  { timestamps: true },
);

// Индексы для оптимизации запросов
UserSchema.index({
  "activeSubscriptions.unLimitedBookingSubscription.expiresAt": 1,
});
UserSchema.index({
  "activeSubscriptions.showContactSubscription.expiresAt": 1,
});

export default mongoose.model("User", UserSchema);
