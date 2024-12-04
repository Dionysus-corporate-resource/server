import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
//
import { registerValidator, loginValidator } from "./validations/auth.js";
import { auth } from "./controllers/user-controller.js";
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

mongoose
  .connect(process.env.DATABASE_DEVELOP_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));
// Маршруты
app.get("/", (req, res) => {
  res.send("Привет, Roma! Это твой первый сервер на Express с модулями ES6!!");
});

// auth
app.post("/auth/register", registerValidator, auth.register);
app.post("/auth/login", loginValidator, auth.login);
app.get("/auth/me", check.isAuth, auth.getMe);
// booking
app.post("/booking", check.isManager, bookingValidator, booking.create);
app.put("/booking/:id", check.isManager, bookingValidator, booking.toggle);
app.get("/booking", booking.getAll);
app.get("/booking/:id", booking.getOne);
app.delete("/booking/:id", check.isManager, booking.remove);
// proposalsDevelopment
app.get("/proposals-development", check.isAuth, proposalsDevelopment.getAll);
app.post(
  "/proposals-development",
  check.isAuth,
  proposalsDevelopmentValidator,
  proposalsDevelopment.create,
);
// company
app.post("/company/register", company.registerCompany);
app.post("/company/login", company.login);
app.post(
  "/company/register-employee",
  check.isExistingCompany,
  check.isNeedRoles(["general_director"]),
  company.registerLogisticianInCompany,
);

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
