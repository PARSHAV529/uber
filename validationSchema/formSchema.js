//Joi validation Schema
import Joi from "joi";  

export const loginValidationSchema = Joi.object(
    {
        email : Joi.string().email().required().messages(
            {
                'string.base' : `please write a email`,
                'string.empty' : `please write an email`,
                'string.email' : `please write valid email`
            }
        ),

        password : Joi.string().required().messages(
            {
                'string.base' : `please write password`,
                'string.empty' : `please write password`
            }
        )
    }
)

export const createProfileSchema = Joi.object({
  fname: Joi.string().pattern(/^[A-Za-z]+$/).required().messages({
    "string.base": `Please enter valid first name`,
    "string.empty": `Please enter first name`,
    "string.pattern.base":"Please enter valid first name"
  }),
  lname: Joi.string().pattern(/^[A-Za-z]+$/).required().messages({
    "string.base": `Please enter valid last name`,
    "string.empty": `Please enter last name`,
     "string.pattern.base":"Please enter valid last name"
  }),
  pass: Joi.string().min(3).max(15).required().label("Password").messages({
    "string.base": `Please enter valid password`,
    "string.min":`Password must be at least 3 character long`,
    "string.max":`Password must be less than or equal to 15 characters long`,
    "string.empty": `Please enter password`,
  }),
  cmfpass: Joi.any()
    .equal(Joi.ref("pass"))
    .required()
    .label("Confirm password")
    .messages({
      "string.base": `Please enter valid confirm password`,
      "string.empty": `Please enter confirm password`,
      "any.only": "Re-entered password does not match",
    }),
  phone: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.empty": `Please enter your phone number`,
      "string.length": `Phone number length must be 10 digits long`,
      "string.pattern.base":"Please enter valid phone number"
    }),
});

export const emailValidationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": `Please enter a email`,
    "string.empty": `Please enter a email`,
    "string.email": `Please enter valid email`,
  }),
});
