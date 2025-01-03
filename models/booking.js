import mongoose from "mongoose";

export const BookingSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      requires: true,
      enum: ["active", "inProgress", "inactive"],
      default: "active",
    },
    generalInformation: {
      icon: { type: String, required: true },
      relevance: { type: Boolean, default: true },
      cargoName: { type: String, required: true },
      cargoAmount: { type: Number, default: null },
    },
    location: {
      loadingLocation: { type: String, required: true },
      loadingLocationDate: { type: String, default: null },
      unloadingLocation: { type: String, required: true },
      distance: { type: Number, required: true, min: 0 },
    },
    terms: {
      price: { type: Number, required: true, min: 0 },
      paymentMethod: {
        type: String,
        required: true,
        enum: ["NDS", "without_NDS", "cash"],
      },
      advancePercentage: { type: Number, min: 0, max: 100, default: null },
      loadingType: {
        type: String,
        required: true,
        enum: ["normal", "full"],
      },
    },
    requiredTransport: {
      carType: {
        type: String,
        required: true,
        enum: ["Самосвал", "Танар", "Полу_прицеп", "Сцепка", "Любые_машины"],
      },
      carTypeUnLoading: {
        type: String,
        required: true,
        enum: [
          "Боковая",
          "Задняя",
          "На_правый_бок",
          "На_левый_бок",
          "Задняя_самосвальная",
          "Боковая_самосвальная",
          "Любая",
        ],
      },
      carHeightLimit: {
        type: Number,
        min: 0,
        default: null,
      },
      carUsage: {
        count: { type: Number, default: null },
        carPeriod: {
          type: String,
          enum: ["Каждый_день", "Общее"],
          default: null,
        },
      },
    },
    additionalInfo: { type: String, default: null },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Logistician",
      require: true,
    },
  },
  { timestamps: true },
);

export const BookingModel = mongoose.model("Booking", BookingSchema);
export const CorporateBookingModel = mongoose.model(
  "CorporateBooking",
  BookingSchema,
);
