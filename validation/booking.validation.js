import { Joi, validate } from "express-validation";

const contactSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
});

const locationSchema = Joi.object({
  name: Joi.string().required(),
  coordinates: Joi.array().items(Joi.number()).allow(null).default(null),
});

const basicInfoSchema = Joi.object({
  distance: Joi.string().required(),
  loadingLocation: locationSchema.required(),
  unLoadingLocation: Joi.string().required(),
  tonnage: Joi.string().allow(null).default(null),
  culture: Joi.string().required(),
  ratePerTon: Joi.string().required(),
  companyName: Joi.string().required(),
  contact: contactSchema.required(),
});

const additionalConditionsSchema = Joi.object({
  additionalInformation: Joi.string().allow(null).default(null),
  loadingMethod: Joi.string().allow(null).default(null),
  isCharterNeeded: Joi.boolean().required(),
  maxVehicleHeight: Joi.string().allow(null).default(null),
  loadingType: Joi.string().valid("full", "normal").required(),
  vehicleType: Joi.string().allow(null).default(null),
  unloadingType: Joi.string().allow(null).default(null),
  estimatedLoadingDate: Joi.date().allow(null).default(null),
  paymentType: Joi.string()
    .valid("cash", "without_nds", "nds", "nds_20", "nds_15", "nds_10", "nds_5")
    .required(),
}).allow(null); // Ключевое правило: разрешаем null

export const bookingValidators = {
  createShortBooking: validate({
    body: Joi.object({
      // status: Joi.string().valid("active", "inProgress", "inactive").required(),
      basicInfo: basicInfoSchema.required(),
    }),
  }),
  createDetailBooking: validate({
    body: Joi.object({
      basicInfo: basicInfoSchema.required(),
      additionalConditions: additionalConditionsSchema,
    }),
  }),
  editShortBooking: validate({
    body: Joi.object({
      status: Joi.string().valid("active", "archive", "inactive").required(),
      basicInfo: basicInfoSchema.required(),
    }),
  }),
  editDetailBooking: validate({
    body: Joi.object({
      status: Joi.string().valid("active", "archive", "inactive").required(),
      basicInfo: basicInfoSchema.required(),
      additionalConditions: additionalConditionsSchema,
    }),
  }),
  updateStatusBooking: validate({
    body: Joi.object({
      status: Joi.string().valid("active", "archive", "inactive").required(),
    }),
  }),
};
