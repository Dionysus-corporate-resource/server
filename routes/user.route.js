import express from "express";
import checkAuth from "../middlewares/auth.middleware.js";
import { userValidators } from "../validation/user.validation.js";
import { userControllers } from "../controllers/user.controller.js";

const router = express.Router();

router.put(
  "/edit-profile",
  checkAuth,
  userValidators.editProfile,
  userControllers.editProfile,
);

export default router;
