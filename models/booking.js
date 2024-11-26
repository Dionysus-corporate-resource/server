import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    relevance: { type: Boolean, required: true },
    cargoName: { type: String, required: true },
    cargoAmount: { type: Number },
    loadType: {
      type: String,
      required: true,
      enum: ["normal", "full"], // Используем значения из ILoadType
    },
    location: {
      loadingLocation: { type: String, required: true },
      unloadingLocation: { type: String, required: true },
      distance: { type: Number, required: true, min: 0 },
    },
    terms: {
      price: { type: Number, required: true, min: 0 },
      paymentMethod: {
        type: String,
        required: true,
        enum: ["NDS", "without NDS", "cash"], // Используем значения из IPaymentMethod
      },
      truckType: { type: String, required: true },
    },
    advance: {
      percentage: { type: Number, min: 0, max: 100 }, // От 0 до 100
    },
    additionalInfo: { type: String },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", BookingSchema);
