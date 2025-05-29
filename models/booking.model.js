import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
});

const AdditionalConditionsSchema = new mongoose.Schema({
  additionalInformation: { type: String, require: true, nullable: true },
  // способ погр.
  loadingMethod: { type: String, require: true, nullable: true },
  // хартия
  isCharterNeeded: { type: Boolean, require: true },
  // высота м.
  maxVehicleHeight: { type: String, require: true, nullable: true },
  // как грузят норма/по полной
  loadingType: {
    type: String,
    required: true,
    enum: ["full", "normal"],
  },
  // тип машины
  vehicleType: { type: String, require: true, nullable: true },
  // тип выгрузки
  unloadingType: { type: String, require: true, nullable: true },
  estimatedLoadingDate: { type: Date, require: true, nullable: true },
  // тип оплаты
  paymentType: {
    type: String,
    required: true,
    enum: ["cash", "without_nds", "nds", "nds_20", "nds_15", "nds_10", "nds_5"],
  },
});

const BookingSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["active", "archive", "inactive"],
      default: "active",
    },
    basicInfo: {
      distance: { type: String, require: true },
      loadingLocation: {
        name: { type: String, required: true },
        coordinates: {
          type: [Number],
          require: true,
          nullable: true,
        },
      },
      unLoadingLocation: { type: String, required: true },
      tonnage: { type: String, require: true, nullable: true },
      culture: { type: String, required: true },
      ratePerTon: { type: String, required: true },
      companyName: { type: String, required: true },
      contact: { type: ContactSchema, required: true },
    },
    additionalConditions: {
      type: AdditionalConditionsSchema,
      require: true,
      nullable: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    view: { type: Number, default: 0 },
  },
  { timestamps: true },
);
export default mongoose.model("Booking", BookingSchema);
