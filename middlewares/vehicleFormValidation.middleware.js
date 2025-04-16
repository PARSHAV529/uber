import { errorResponse } from "../utils/helper.js";
import { vehicleFormSchema } from "../validationSchema/vehicleFormSchema.js";

export const vehicleFormValidation = (req, res, next) => {
    console.log(req.body);
    
  const { error } = vehicleFormSchema.validate({vehicle_type:req.body.type,vehicle_colour:req.body.colour,vehicle_number:req.body.Number_plate,puc_exp_date:req.body.PUC_Exp_date,insurance_exp_date:req.body.insurance_Exp_date}, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => err.message);
    return errorResponse(res, 400, errors);
  }
};
