import { body } from "express-validator";

export const bookingValidator = [
  // Basic Info
  body(
    "basicInfo.distance",
    "Расстояние должно быть строкой и не может быть пустым",
  )
    .isString()
    .notEmpty(),

  body(
    "basicInfo.loadingLocation.name",
    "Название места погрузки должно быть строкой и не может быть пустым",
  )
    .isString()
    .notEmpty(),
  body(
    "basicInfo.loadingLocation.coordinates",
    "Координаты должны быть массивом из двух чисел или null",
  )
    .optional()
    .custom((value) => {
      if (value === null) return true;
      return (
        Array.isArray(value) &&
        value.length === 2 &&
        value.every((coord) => typeof coord === "number")
      );
    }),
  body(
    "basicInfo.unLoadingLocation",
    "Место выгрузки должно быть строкой и не может быть пустым",
  )
    .isString()
    .notEmpty(),
  body(
    "basicInfo.tonnage",
    "Тоннаж должен быть строкой и не может быть пустым",
  ).optional(),
  body(
    "basicInfo.culture",
    "Культура должна быть строкой и не может быть пустым значением",
  )
    .isString()
    .notEmpty(),

  // Conditions Transportation
  body(
    "conditionsTransportation.loadingMethod",
    "Метод погрузки должен быть строкой и не может быть пустым",
  ).optional(),
  body(
    "conditionsTransportation.scaleCapacity",
    "Вместимость весов должна быть строкой и не может быть пустой",
  ).optional(),
  body(
    "conditionsTransportation.loadingDate",
    "Дата погрузки должна быть действительной датой",
  ).isString(),
  // .isDate()

  // Detail Transportation
  body(
    "detailTransportation.demurrage",
    "Демередж должен быть строкой и не может быть пустым",
  ).optional(),
  body(
    "detailTransportation.allowedShortage",
    "Допустимая недостача должна быть строкой и не может быть пустым значением",
  ).optional(),
  body(
    "detailTransportation.paymentType",
    "Тип оплаты должен быть одним из: 'cash', 'nds', 'without_nds'",
  )
    .isString()
    .isIn([
      "cash",
      "nds",
      "without_nds",
      "nds_20",
      "nds_15",
      "nds_10",
      "nds_5",
    ]),
  body(
    "detailTransportation.ratePerTon",
    "Тариф за тонну должен быть строкой и не может быть пустым",
  )
    .isString()
    .notEmpty(),
  body(
    "detailTransportation.paymentDeadline",
    "Срок оплаты должен быть строкой и не может быть пустым",
  ).optional(),

  // Additional Conditions
  body(
    "additionalConditions.additionalInformation",
    "Дополнительная информация должна быть строкой и не может быть пустой",
  ).optional(),
  body(
    "additionalConditions.contacts",
    "Контакты должны быть массивом объектов",
  ).isArray(),
  body(
    "additionalConditions.contacts.*.name",
    "Имя контакта должно быть строкой и не может быть пустым",
  )
    .isString()
    .notEmpty(),
  body(
    "additionalConditions.contacts.*.phone",
    "Телефон контакта должен быть строкой и не может быть пустым",
  )
    .isString()
    .notEmpty(),
];
