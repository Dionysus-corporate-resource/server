import jwt from "jsonwebtoken";
import UserModel from "../models/user.js";

export const check = {
  isAuth: (req, res, next) => {
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");

    if (!token) {
      return res.status(403).json({
        message: "У вас нет доступа",
      });
    }

    try {
      const decoded = jwt.verify(token, "secret123");
      req.userId = decoded._id;
      next();
    } catch (err) {
      return res.status(403).json({
        message: "Ошибка при расшифровываннии токена",
      });
    }
  },
  isManager: async (req, res, next) => {
    const token = (req.headers.authorization || "").replace(/Bearer\s?/, "");
    console.log("isManager", token);

    if (!token) {
      return res.status(403).json({
        message: "У вас нет доступа",
      });
    }

    try {
      const decoded = jwt.verify(token, "secret123");
      req.userId = decoded._id;

      const user = await UserModel.findById(decoded._id);
      console.log("userId", decoded._id);
      console.log("user", user);

      const hasBookingRoles = user.roles.some(
        (role) => role === "super-viser" || role === "manager",
      );
      console.log("role", hasBookingRoles);

      if (!hasBookingRoles) {
        return res.status(403).json({
          message: "У вас нет прав для этого действия",
        });
      }

      next();
    } catch (err) {
      return res.status(403).json({
        message: "Ошибка при расшифровываннии токена",
      });
    }
  },
};
