import mongoose from "mongoose";
import { BookingSchema } from "./booking.js";

// Модель с сотрудниками
const employeeSchema = new mongoose.Schema({
  additionalInfo: { type: String },
  userData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Logistician",
    require: true,
  },
  corporatePasswordHash: { type: String, require: true },
  corporateRoles: {
    type: [String],
    enum: ["super_viser", "dispatcher", "manager", "general_director"],
    default: [],
  },
});
// Модель водителя
const carDriverSchema = new mongoose.Schema({
  numberCar: { type: String, required: true },
  numberTrailer: { type: String, default: null },
  driverFullName: { type: String, required: true },
  phone: { type: String, default: null },
});
// Модель для рейсов
const flightSchema = new mongoose.Schema(
  {
    dispatcher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Logistician",
      required: true,
    },
    cars: [carDriverSchema],
    organization: { type: String, required: true },
  },
  { timestamps: true },
);

// Модель с Корпоративными заявками
const corporateBooking = {
  corporateBookingData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CorporateBooking",
  },
  flight: { type: [flightSchema], default: [] },
};

const CompanySchema = new mongoose.Schema(
  {
    nameCompany: { type: String, required: true },
    employees: [employeeSchema],
    corporateBooking: [corporateBooking],
  },
  { timestamps: true },
);

export default mongoose.model("Company", CompanySchema);

// Внутри корпорации создание заявок будут добавляться только к ним в массив bookings
// Потом, если они захотят выложить ее на ощий сайт, за это будет списоваться копеечка и уже потом
// Их заявка будет выкладываться в общую коллекцию
//
//
// Нужна схеа
