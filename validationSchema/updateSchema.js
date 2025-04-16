import Joi from "joi"

export const updateProfileSchema = Joi.object(
    {
        fname : Joi.string().required().messages(
            {
                'string.base' : `please write valid first name`,
                'string.empty' : `please write first name`
            }
        ),
        lname : Joi.string().required().messages(
            {
                'string.base' : `please write valid last name`,
                'string.empty' : `please write last name`
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
        ),
        dob : Joi.string().required().messages(
            {
                'string.base' : `please write valid date of birth`,
                'string.empty' : `please write date of birth`
            }
        )
    }
)
