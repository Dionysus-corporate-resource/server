import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("✳️ Подключение к MongoDB прошло успешно"))
      .catch((err) => console.error("Error connecting to MongoDB", err));
    console.log("✳️ Подключение к MongoDB прошло успешно");
  } catch {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
};

export default connectDB;
