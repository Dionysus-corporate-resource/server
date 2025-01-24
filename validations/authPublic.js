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

// const [formData, setFormData] = useState<IFormData>({
//   userName: userData?.userName || "",
//   email: userData?.email || "",
//   phone: userData?.phone || "",
//   roles: userData?.roles || "driver",
//   nameCompany: userData?.companyPublicData?.nameCompany || "",
// });

export const updateProfileValidator = [
  // body("email", "Не верный формат почты").isEmail(),
  body("userName").isString(),
  body("roles")
    .isString()
    .isIn(["customer", "driver"])
    .withMessage("Роль должна быть либо 'Заказчик', либо 'Водитель'"),
  body("phone", "Не верный формат телефона").isMobilePhone(),
  body("nameCompany")
    .optional()
    .custom((value) => value === null || typeof value === "string")
    .withMessage("Название компании должно быть строкой или null"),
];
