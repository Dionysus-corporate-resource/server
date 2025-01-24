import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
//
import { registerValidator, loginValidator } from "./validations/authPublic.js";
import { authPublicSite } from "./controllers/user-controller.js";
import { booking } from "./controllers/booking-controller.js";
import { bookingValidator } from "./validations/booking.js";
import { check } from "./utils/checkAuth.js";
import { proposalsDevelopment } from "./controllers/proposals-development-controller.js";
import { proposalsDevelopmentValidator } from "./validations/proposals-development.js";
import { company } from "./controllers/company-controller.js";

dotenv.config();
// Загружаем переменные из .env c
const app = express();
app.use(cors());
app.use(express.json());

// DATABASE_DEVELOP_URL
// DATABASE_URL
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));
// Маршруты
app.get("/", (req, res) => {
  res.send(
    "Привет, Roma! Это твой первый сервер на Express с модулями ES6!! New Version",
  );
});

// auth
app.post("/auth/register", registerValidator, authPublicSite.register);
app.post("/auth/login", loginValidator, authPublicSite.login);
// app.get("/auth/me", check.isAuth, authPublicSite.getMe);

// booking
// app.post("/booking", check.isManager, bookingValidator, booking.create);
// app.put("/booking/:id", check.isManager, bookingValidator, booking.toggle);
// app.get("/booking", booking.getAll);
// app.get("/booking/:id", booking.getOne);
// app.delete("/booking/:id", check.isManager, booking.remove);
// proposalsDevelopment
// app.get("/proposals-development", check.isAuth, proposalsDevelopment.getAll);
// app.post(
//   "/proposals-development",
//   check.isAuth,
//   proposalsDevelopmentValidator,
//   proposalsDevelopment.create,
// );
// company
// auth
// app.post("/company/register", company.registerCompany);
// app.post("/company/login", company.login);
// app.post(
//   "/company/register-employee",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director"]),
//   company.registerLogisticianInCompany,
// );
// app.delete(
//   "/company/employee/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director"]),
//   company.removeLogisticianFromCompany,
// );
// app.put(
//   "/company/employee/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director"]),
//   company.toggleLogisticianRolesFromCompany,
// );
// app.get(
//   "/company/employee",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager"]),
//   company.getAllEmployees,
// );
// // corporate-booking
// app.post(
//   "/company/booking",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager"]),
//   company.createCorporateBooking,
// );
// app.get(
//   "/company/booking",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager", "dispatcher"]),
//   company.getAllCorporateBooking,
// );
// app.get(
//   "/company/booking/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager", "dispatcher"]),
//   company.getOneCorporateBooking,
// );
// app.delete(
//   "/company/booking/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager"]),
//   company.removeCorporateBooking,
// );
// app.put(
//   "/company/booking/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager"]),
//   company.toggleCorporateBooking,
// );
// app.put(
//   "/company/booking-status/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["general_director", "manager"]),
//   company.toggleCorporateBookingStatus,
// );
// // flight
// app.get(
//   "/company/flight/:bookingId/:flightId",
//   check.isExistingCompany,
//   check.isNeedRoles(["dispatcher", "general_director"]),
//   company.getFlightForCorporateBooking,
// );
// app.post(
//   "/company/flight/:id",
//   check.isExistingCompany,
//   check.isNeedRoles(["dispatcher", "general_director"]),
//   company.createFlightForCorporateBooking,
// );
// app.put(
//   "/company/flight/:bookingId/:flightId",
//   check.isExistingCompany,
//   check.isNeedRoles(["dispatcher", "general_director"]),
//   company.toggleFlightCorporateBooking,
// );
// app.delete(
//   "/company/flight/:bookingId/:flightId",
//   check.isExistingCompany,
//   check.isNeedRoles(["dispatcher", "general_director"]),
//   company.removeFlightCorporateBooking,
// );

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
