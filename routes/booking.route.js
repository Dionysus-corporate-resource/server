import express from "express";
import checkAuth from "../middlewares/auth.middleware.js";
import { bookingValidators } from "../validation/booking.validation.js";
import { bookingControllers } from "../controllers/booking.controller.js";

const router = express.Router();

router.get("/", bookingControllers.getAll);
router.get("/:bookingId", bookingControllers.getByIdBooking);
router.get("/user", checkAuth, bookingControllers.getUserBooking);

router.delete("/:bookingId", bookingControllers.removeBooking);
router.patch(
  "/:bookingId",
  bookingValidators.updateStatusBooking,
  bookingControllers.updateStatusBooking,
);

router.post(
  "/short",
  checkAuth,
  bookingValidators.createShortBooking,
  bookingControllers.createShortBooking,
);
router.post(
  "/detail",
  checkAuth,
  bookingValidators.createDetailBooking,
  bookingControllers.createDetailBooking,
);

// редактирование
router.patch(
  "/short/:bookingId",
  checkAuth,
  bookingValidators.editShortBooking,
  bookingControllers.editShortBooking,
);
router.patch(
  "/detail/:bookingId",
  checkAuth,
  bookingValidators.editDetailBooking,
  bookingControllers.editDetailBooking,
);

export default router;
