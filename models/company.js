import mongoose from "mongoose";
import { BookingSchema } from "./booking.js";

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

const CompanySchema = new mongoose.Schema(
  {
    nameCompany: { type: String, required: true },
    employees: [employeeSchema],
    booking: [BookingSchema],
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
