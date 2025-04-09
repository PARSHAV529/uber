//Joi validation Schema
import Joi from "joi"

export const driverDocumentSchema = Joi.object(
    {
        email : Joi.string().email().required().messages(
            {
                'string.base' : `please write a valid email`,
                'string.email' : `please write valid email`,
                'string.empty' : `please write an email`
            }
        ),
        fname : Joi.string().required().messages(
            {
                'string.base' : `please write valid first name`,
                'string.empty' : `please write first name`
            }
        ),
        lname : Joi.string().required().messages(
            {
                'string.base' : `please write last name`,
                'string.empty' : `please write last name`
            }
        ),
        pass : Joi.string().required().messages(
            {
                'string.base' : `please write valid password`,
                'string.empty' : `please write password`
            }
        ),
        cmfpass : Joi.string().required().messages(
            {
                'string.base' : `please write valid confirm password`,
                'string.empty' : `please write confirm password`
            }
        ),
        phone : Joi.string().min(10).max(10).messages(
            {
                'string.empty' : `please write your phone number`,
                'string.max' : `phone number has maximun 10 digits`,
                'string.min' : `phone number has minimum 10 digits`,
            }
        ),

        phoneNo : Joi.number().messages(
            {
                'number.base' : `please enter a valid phone number`
            }
        )
    }
)

