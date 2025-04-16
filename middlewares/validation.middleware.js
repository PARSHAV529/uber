import {
  createProfileSchema,
  emailValidationSchema,
  loginValidationSchema,
} from "../validationSchema/formSchema.js";
import { response, errorResponse } from "../utils/helper.js";

export const validateCreateProfile = (req, res, next) => {
  const { error } = createProfileSchema.validate({
    fname: req.body.fname,
    lname: req.body.lname,
    phone: req.body.phone,
    pass: req.body.password,
    cmfpass: req.body.cmfpassword,
  });

  if (error) {
    // console.log(error);
    return errorResponse(res, 400, `${error.message}`);
  } else {
    next();
  }
};

export const emialValidate = (req, res, next) => {
  const { error } = emailValidationSchema.validate({
    email: req.body.email,
  });

  if (error) {
    return errorResponse(res, 400, `${error.message}`);
  } else {
    next();
  }
};

export const loginValidation = async(req,res,next) => {
  try {
    const {error} = loginValidationSchema.validate(
      {
        email : req.body.email,
        password : req.body.password
      }
    )

    if(error){
      return errorResponse(res,400,`${error.message}`)
    }else{
      next();
    }
  } catch (error) {
    // console.log(`loginValidation : Error : ${error.message}`)
    return errorResponse(res,500,`Internal server error : ${error.message}`)
  }
} 
