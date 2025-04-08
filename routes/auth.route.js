import express from "express";
import {
  requestRide,
  getDirections,
  cancelRide,
  riderRideReview,
} from "../controllers/request.ride.js";
import { getRiderHistory } from "../controllers/rider.history.js";
import {
  getRiderProfile,
  updateRiderProfile,
} from "../controllers/rider.profile.js";
import {
  updateRiderPassword,
  updateRiderPasswordOTP,
} from "../controllers/rider.security.js";
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
//update rider profile
router.post("/rider/update-profile", updateRiderProfile);
//submit rider review
router.post("/rider/ride-review", riderRideReview);
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
  getDriverSignupVehicalData,
  postDriverSignupDocument,
  postDriverSignupVehicalData,
} from "../controllers/auth.controller.js";
import { handleDriverDocument } from "../middlewares/handleDriverDocumentmulter.middleware.js";
import { handleDriverDocumentCloudinary } from "../middlewares/handleDriverDocumentCloudinary.middleware.js";
import {
  emialValidate,
  validateCreateProfile,
} from "../middlewares/validation.middleware.js";

const driverSignupRouter = Router();
driverSignupRouter.get("/uploadDocument", getDriverSignupDocumentPage);
driverSignupRouter.post(
  "/uploadDocument",
  handleDriverDocument.single("document"),
  handleDriverDocumentCloudinary,
  postDriverSignupDocument
);
driverSignupRouter.get("/getDocumentPageData", getDriverSignupDocumentPageData);
driverSignupRouter.get("/getVehicalDocumentData", getDriverSignupVehicalData);
driverSignupRouter.post(
  "/postDriverSignupVehicalData",
  handleDriverDocument.fields([
    { name: "RC_BOOK", maxCount: 1 },
    { name: "PUC", maxCount: 1 },
    { name: "Insurance", maxCount: 1 },
  ]),
  handleDriverDocumentCloudinary,
  postDriverSignupVehicalData
);
export default driverSignupRouter;
