import { body } from "express-validator";

export const proposalsDevelopmentValidator = [
  // Валидация поля "name"
  body("name", "Name is required and must be a string").isString().notEmpty(),

  // Валидация поля "description" (необязательное поле)
  body("description", "Description must be a string").optional().isString(),

  // Валидация поля "topic"
  body("topic", "Invalid topic, must be one of 'bag' or 'proposals'")
    .isString()
    .isIn(["bag", "proposals"]),

  // Валидация поля "status"
  // body(
  //   "status",
  //   "Invalid status, must be one of 'in_progress', 'pending', or 'done'",
  // )
  //   .isString()
  //   .isIn(["in_progress", "pending", "done"]),
];
