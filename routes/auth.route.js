import express from "express";
import {
  requestRide,
  getDirections,
  cancelRide,
  riderRideReview,
} from "../controllers/request.ride.js";
import { getRiderHistory } from "../controllers/rider.history.js";
import { getRiderProfile,updateRiderProfile, updateRiderProfilePicture } from "../controllers/rider.profile.js";
import { validateUpdateProfile } from "../middlewares/updateValidation.middleware.js";
const router = express.Router();

//inserting trip request info
router.post("/rider/request-ride", requestRide);
//getting requested trip's info for waiting page
router.get("/rider/get-directions", getDirections);
//canceling ride
router.post("/rider/cancel-ride", cancelRide);
//show rider history
router.get("/rider/get-history", getRiderHistory);
//show rider profile
router.get("/rider/get-profile", getRiderProfile);
//submit rider review
router.post("/rider/ride-review", riderRideReview);
router.post('/rider/update-profile', validateUpdateProfile, updateRiderProfile)
//update rider profile picture
router.post('/rider/update-profile-picture',updateRiderProfilePicture)


export { router };
import {
  emailAuth,
  insertSignUpDetails,
  verifyOTP,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();
authRouter.post("/email-auth", emialValidate, emailAuth);
authRouter.post("/otp-verification", verifyOTP);
authRouter.post("/sign-up-details", validateCreateProfile, insertSignUpDetails);
authRouter.post("/sign-up-details", insertSignUpDetails);
export { authRouter };

import pkg from "express";
const { Router } = pkg;
import {
  getDriverSignupDocumentPage,
  getDriverSignupDocumentPageData,
  getDriverSignupvehicleData,
  postDriverSignupDocument,
  postDriverSignupvehicleData,
} from "../controllers/auth.controller.js";
import { handleDriverDocument } from "../middlewares/handleDriverDocumentmulter.middleware.js";
import { handleDriverDocumentCloudinary } from "../middlewares/handleDriverDocumentCloudinary.middleware.js";
import {
  emialValidate,
  validateCreateProfile,
} from "../middlewares/validation.middleware.js";
import { handleMulterErr } from "../middlewares/handleMulterErr.js";

const driverSignupRouter = Router();
driverSignupRouter.get("/uploadDocument", getDriverSignupDocumentPage);
driverSignupRouter.post(
  "/uploadDocument",
  handleDriverDocument.single("document"),
  handleMulterErr,
  handleDriverDocumentCloudinary,
  postDriverSignupDocument
);
driverSignupRouter.get("/getDocumentPageData", getDriverSignupDocumentPageData);
driverSignupRouter.get("/getvehicleDocumentData", getDriverSignupvehicleData);
driverSignupRouter.post(
  "/postDriverSignupvehicleData",
  handleDriverDocument.fields([
    { name: "RC_BOOK", maxCount: 1 },
    { name: "PUC", maxCount: 1 },
    { name: "Insurance", maxCount: 1 },
  ]),
  handleDriverDocumentCloudinary,
  postDriverSignupvehicleData
);
export default driverSignupRouter;
