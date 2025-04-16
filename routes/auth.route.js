import express from "express";

const router = express.Router();

export { router };
import {
  emailAuth,
  insertSignUpDetails,
  userLogout,
  verifyOTP,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();
authRouter.post("/logout",userLogout)
authRouter.post("/email-auth", emialValidate, emailAuth);
authRouter.post("/otp-verification", verifyOTP);
authRouter.post("/sign-up-details", authApiCreateProfile, validateCreateProfile, insertSignUpDetails);
// authRouter.post("/sign-up-details", insertSignUpDetails);
export { authRouter };

import pkg from "express";
const { Router } = pkg;
import {
  getDriverSignupDocumentPageData,
  getDriverSignupvehicleData,
  postDriverSignupDocument,
  postDriverSignupvehicleData,
} from "../controllers/auth.controller.js";
import { handleDriverDocument,handleVehicleDocuments } from "../middlewares/handleDriverDocumentmulter.middleware.js";
import { handleDriverDocumentCloudinary } from "../middlewares/handleDriverDocumentCloudinary.middleware.js";
import {
  emialValidate,
  validateCreateProfile,
} from "../middlewares/validation.middleware.js";
import { handleMulterErr } from "../middlewares/handleMulterErr.js";
import { fileValidationJoi } from "../middlewares/fileValidationJoi.middleware.js";
import { vehicleFormValidation } from "../middlewares/vehicleFormValidation.middleware.js";
import { authApiCreateProfile } from "../middlewares/auth.middleware.js";

const driverSignupRouter = Router();

driverSignupRouter.post(
  "/uploadDocument",
  handleDriverDocument.single("document"),
  handleMulterErr,
  fileValidationJoi,
  handleDriverDocumentCloudinary,
  postDriverSignupDocument
);
driverSignupRouter.get("/getDocumentPageData", getDriverSignupDocumentPageData);
driverSignupRouter.get("/getvehicleDocumentData", getDriverSignupvehicleData);
driverSignupRouter.post(
  "/postDriverSignupvehicleData",
  handleVehicleDocuments.fields([
    { name: "RC_BOOK", maxCount: 1 },
    { name: "PUC", maxCount: 1 },
    { name: "Insurance", maxCount: 1 },
  ]),vehicleFormValidation,fileValidationJoi,
  handleDriverDocumentCloudinary,
  postDriverSignupvehicleData
);
export default driverSignupRouter;
