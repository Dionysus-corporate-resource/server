import express from "express";
import { authValidators } from "../validation/auth.validation.js";
import { authControllers } from "../controllers/auth.controller.js";
import checkAuth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", authValidators.register, authControllers.register);
router.post("/login", authValidators.login, authControllers.login);
router.get("/me", checkAuth, authControllers.getMe);

export default router;
