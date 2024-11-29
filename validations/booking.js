import { body } from "express-validator";

export const bookingValidator = [
  // General Information
  body(
    "generalInformation.icon",
    "Cargo name must be a string with at least 3 characters",
  ).isString(),
  body(
    "generalInformation.relevance",
    "Relevance must be a boolean value",
  ).isBoolean(),
  body(
    "generalInformation.cargoName",
    "Cargo name must be a string with at least 3 characters",
  )
    .isString()
    .isLength({ min: 3 }),
  body(
    "generalInformation.cargoAmount",
    "Cargo amount must be a positive number",
  )
    .optional()
    .isFloat({ min: 0 }),

  // Location
  body(
    "location.loadingLocation",
    "Loading location must be a non-empty string",
  )
    .isString()
    .notEmpty(),
  body(
    "location.loadingLocationDate",
    "Loading location date must be a valid ISO date",
  )
    .optional()
    .isString(),

  body(
    "location.unloadingLocation",
    "Unloading location must be a non-empty string",
  )
    .isString()
    .notEmpty(),
  body("location.distance", "Distance must be a positive number").isFloat({
    min: 0,
  }),

  // Terms
  body("terms.price", "Price must be a positive number").isFloat({ min: 0 }),
  body("terms.paymentMethod", "Invalid payment method")
    .isString()
    .isIn(["NDS", "without_NDS", "cash"]),
  body(
    "terms.advance.percentage",
    "Advance percentage must be between 0 and 100",
  )
    .optional()
    .isFloat({ min: 0, max: 100 }),
  body(
    "terms.advance.period",
    "Advance period must be either 'loading' or 'un_loading'",
  )
    .optional()
    .isString()
    .isIn(["loading", "un_loading"]),
  body("terms.loadingType", "Invalid loading type")
    .isString()
    .isIn(["normal", "full"]),

  // Required Transport
  body("requiredTransport.carType", "Car type must be an array of valid values")
    .isString()

    .isIn(["Самосвал", "Танар", "Полу_прицеп", "Сцепка", "Любые_машины"]),
  body(
    "requiredTransport.carTypeUnLoading",
    "Car type unloading must be an array of valid values",
  )
    .isString()
    .isIn([
      "Боковая",
      "Задняя",
      "На_правый_бок",
      "На_левый_бок",
      "Задняя_самосвальная",
      "Боковая_самосвальная",
      "Любая",
    ]),
  body(
    "requiredTransport.carHeightLimit",
    "Car height limit must be a positive number",
  )
    .optional()
    .isFloat({ min: 0 }),
  body(
    "requiredTransport.carUsage.count",
    "Car usage count must be a positive number",
  )
    .optional()
    .isFloat({ min: 0 }),
  body(
    "requiredTransport.carUsage.carPeriod",
    "Car usage period must be an array of valid values",
  )
    .optional()
    .isIn(["Каждый_день", "Общее"]),

  // Additional Info
  body("additionalInfo", "Additional info must be a string")
    .optional()
    .isString(),
];
