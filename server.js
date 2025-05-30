import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import connectDB from "./config/db.config.js";
// services
import { startSubscriptionCron } from "./services/subscription.service.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);

const startSever = async () => {
  try {
    await connectDB()
      .then(() => console.log("Подключение закончено"))
      .catch((err) => console.error("Ошибка подкючения", err));

    // проверка подписок
    startSubscriptionCron();

    app.listen(PORT, () => {
      console.log(`✳️ Сервер запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
};

startSever();
