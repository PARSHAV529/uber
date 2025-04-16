//Joi validation Schema
import Joi from "joi"

export const driverDocumentSchema = Joi.object(
    {
        file : Joi.object().required().messages(
            {
                'object.base' : `please upload a document`,
                'object.empty' : `please upload a document`
            }
        ),
        size: Joi.number().max(5 * 1024 * 1024).messages(
            {
                'number.max' : `File is too large, maximum size is 5MB`
            }
        ),
        
    
    }
)

