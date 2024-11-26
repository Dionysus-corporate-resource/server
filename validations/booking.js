import { body } from "express-validator";

export const bookingValidator = [
  body("relevance", "Relevance must be a boolean value").isBoolean(),
  body("cargoName", "Cargo name must be a string")
    .isString()
    .isLength({ min: 3 }),
  body("cargoAmount", "Cargo amount must be a number greater than 0"),
  body("loadType", "Invalid load type").isString().isIn(["normal", "full"]),

  // Validation for nested 'location' object
  body(
    "location.loadingLocation",
    "Loading location must be a string",
  ).isString(),
  body(
    "location.unloadingLocation",
    "Unloading location must be a string",
  ).isString(),
  body("location.distance", "Distance must be a positive number").isFloat({
    min: 0,
  }),

  // Validation for nested 'terms' object
  body("terms.price", "Price must be a positive number").isFloat({ min: 0 }),
  body("terms.paymentMethod", "Invalid payment method")
    .isString()
    .isIn(["NDS", "without NDS", "cash"]),
  body("terms.truckType", "Truck type must be a string").isString(),
  body("advance.percentage", "Advance percentage must be between 0 and 100")
    .optional()
    .isFloat({ min: 0, max: 100 }),
  body("additionalInfo", "Additional info must be a string").isString(),
];
