import mongoose from "mongoose";

export const BookingSchema = new mongoose.Schema(
  {
    generalInformation: {
      icon: { type: String, required: true },
      relevance: { type: Boolean, required: true },
      cargoName: { type: String, required: true },
      cargoAmount: { type: Number },
    },
    location: {
      loadingLocation: { type: String, required: true },
      loadingLocationDate: { type: String },
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
      advance: {
        percentage: { type: Number, min: 0, max: 100 },
        period: {
          type: String,
          required: true,
          enum: ["loading", "un_loading"],
        },
      },
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
      },
      carUsage: {
        count: { type: Number },
        carPeriod: {
          type: String,
          required: true,
          enum: ["Каждый_день", "Общее"],
        },
      },
    },
    additionalInfo: { type: String },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Logistician",
      require: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", BookingSchema);
