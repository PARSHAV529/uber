//Joi validation Schema
import Joi from "joi"

export const vehicleFormSchema = Joi.object(
    {
       
        vehicle_type: Joi.string().allow('car', 'bike','rixa').required(),
        vehicle_colour: Joi.string().required().messages(
            {
                'string.base': `please write valid vehicle colour`,
                'string.empty': `please write vehicle colour`
            }
        ),
        vehicle_number: Joi.string().required().messages(
            {
                'string.base': `please write valid vehicle number`,
                'string.empty': `please write vehicle number`
            }
        ),
        puc_exp_date: Joi.string().required().messages(
            {
                'string.base': `please write valid PUC Exp date`,
                'string.empty': `please write PUC Exp date`
            }
        ),
        insurance_exp_date: Joi.string().required().messages(
            {
                'string.base': `please write valid insurance Exp date`,
                'string.empty': `please write insurance Exp date`
            }
        ),
        
        

      
    }
)
