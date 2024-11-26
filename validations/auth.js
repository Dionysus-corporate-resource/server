import { body } from "express-validator";

export const registerValidator = [
  body("email", "Не верный формат почты").isEmail(),
  body("userName").isLength({ min: 3 }),
  body("password").isLength({ min: 6 }),
];

export const loginValidator = [
  body("email", "Не верный формат почты").isEmail(),
  body("password").isLength({ min: 6 }),
];
