import Joi from "joi";

export const vehicleFormSchema = Joi.object({
  type: Joi.string().required().messages({
    "string.empty": "please select your vehicle type",
  }),
  colour: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .required()
    .messages({
      "string.base": `Please enter valid colour`,
      "string.empty": `Please enter colour`,
      "string.pattern.base": "Please enter valid colour",
    }),
  Number_plate: Joi.string()
    .pattern(/^[a-zA-Z]{2}[a-zA-Z0-9\s\W]*$/)
    .required()
    .messages({
      "string.base": `Please enter 1valid number plate`,
      "string.empty": `Please enter number plate `,
      "string.pattern.base": "Please enter valid number plate",
    }),
    PUC_Exp_date: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
    .required()
    .messages({
      "string.base": `Please enter valid puc expiry date`,
      "string.empty": `Please enter puc expiry date`,
      "string.pattern.base": "Please enter valid puc expiry date",
    }),
  insurance_Exp_date: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
    .required()
    .messages({
      "string.base": `Please enter valid insurance expiry date`,
      "string.empty": `Please enter insurance expiry date`,
      "string.pattern.base": "Please enter valid insurance expiry date",
    }),
});
