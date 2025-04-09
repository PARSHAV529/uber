import { updateProfileSchema } from "../validationSchema/updateSchema.js"
import { response,errorResponse } from "../utils/helper.js"

export const validateUpdateProfile = (req,res,next) => {
    const {error} = updateProfileSchema.validate(
        {
            fname : req.body.fname,
            lname : req.body.lname,
            phone : req.body.ph,
            phoneNo : Number(req.body.ph),
            dob : req.body.dob
        },
        {abortEarly: false}
    )

    if(error){
        return errorResponse(res,400,`${error.message}`)
    }else{
        next();
    }
}
