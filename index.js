import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
//
import { registerValidator, loginValidator } from "./validations/auth.js";
import checkAuth from "./utils/checkAuth.js";
import { auth } from "./controllers/user-controller.js";

dotenv.config();
// Загружаем переменные из .env
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// Маршруты
app.get("/", (req, res) => {
  res.send("Привет, Roma! Это твой первый сервер на Express с модулями ES6!!");
});

app.post("/auth/register", registerValidator, auth.register);
app.post("/auth/login", loginValidator, auth.login);
app.get("/auth/me", checkAuth, auth.getMe);

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
