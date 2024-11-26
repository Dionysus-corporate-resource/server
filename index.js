import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Загружаем переменные из .env
dotenv.config();
const app = express();
app.use(cors());
// Middlewares
app.use(express.json());

const PORT = 3000;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// Маршрут для главной страницы
app.get("/", (req, res) => {
  res.send("Привет, Roma! Это твой первый сервер на Express с модулями ES6!!");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
