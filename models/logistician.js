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

const LogisticianSchema = new mongoose.Schema(
  {
    userName: { type: String, require: false, default: "" },
    email: { type: String, require: true, unique: true },
    passwordHash: { type: String, require: true },
    phone: { type: String, require: true },
    companyPublicData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyPublic",
      require: false,
    },
    roles: {
      type: String,
      enum: ["super_viser", "customer", "driver"],
      required: true,
    },
    activeSubscriptions: SubscriptionSchema,
  },
  { timestamps: true },
);

// Индексы для оптимизации запросов
// LogisticianSchema.index({ "activeSubscriptions.purchasedBooking.expiresAt": 1 });
LogisticianSchema.index({
  "activeSubscriptions.unLimitedBookingSubscription.expiresAt": 1,
});
LogisticianSchema.index({
  "activeSubscriptions.showContactSubscription.expiresAt": 1,
});

export default mongoose.model("Logistician", LogisticianSchema);
