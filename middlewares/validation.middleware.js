import {
  createProfileSchema,
  emailValidationSchema,
} from "../validationSchema/formSchema.js";
import { response, errorResponse } from "../utils/helper.js";

export const validateCreateProfile = (req, res, next) => {
  const { error } = createProfileSchema.validate({
    email: req.cookies.userEmail,
    fname: req.body.fname,
    lname: req.body.lname,
    phone: req.body.phone,
    phoneNo: Number(req.body.phone),
    pass: req.body.password,
    cmfpass: req.body.cmfpassword,
  });

  if (error) {
    console.log(error);

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
