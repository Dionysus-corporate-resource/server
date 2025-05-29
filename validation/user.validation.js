import { Joi, validate } from "express-validation";

export const userValidators = {
  editProfile: validate({
    body: Joi.object({
      userName: Joi.string().allow("").min(2).required().default(""),
      phone: Joi.string()
        .pattern(/^\+?[0-9]{10,15}$/)
        .required(),
      roles: Joi.string().valid("driver", "customer").required(),
      companyName: Joi.string().allow(null).default(null),
    }),
  }),
};
