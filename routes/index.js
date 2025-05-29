import { Router } from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import bookingRoutes from "./booking.route.js";
import paymentRoutes from "./payment.route.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("<h1>Вы попали на сервер Gruz</h1>");
});

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/booking", bookingRoutes);
router.use("/payment", paymentRoutes);

export default router;
