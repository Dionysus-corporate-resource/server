import { body } from "express-validator";

export const registerValidator = [
  body("email", "Не верный формат почты").isEmail(),
  body("password").isLength({ min: 6 }),
  body("phone", "Не верный формат телефона").isMobilePhone(),
  body("nameCompany")
    .optional()
    .isString()
    .withMessage("Название компании должно быть строкой"),
];

export const loginValidator = [
  body("email", "Не верный формат почты").isEmail(),
  body("password").isLength({ min: 6 }),
];
