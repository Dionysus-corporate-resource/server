import { Joi, validate } from "express-validation";

export const authValidators = {
  register: validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      phone: Joi.string()
        .pattern(/^\+?[0-9]{10,15}$/)
        .required(),
      // roles: Joi.string().valid("driver", "customer").required(),
      companyName: Joi.string().allow(null).default(null),
    }),
  }),
  login: validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  }),
};
