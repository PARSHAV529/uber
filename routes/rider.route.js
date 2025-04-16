import express from "express";

import { verifyRiderLogin } from "../middlewares/rider.middleware.js";
import { fetchDriverWithinRadius } from "../controllers/rider.controller.js";

import {
  cancelRide,
  getDirections,
  getHistory,
  getRequestDirection,
  getRiderHistory,
  getRiderProfile,
  requestRide,
  riderRideReview,
  updateRiderProfile,
  updateRiderProfilePicture,
  riderLogout,
} from "../controllers/rider.controller.js";
import { validateUpdateProfile } from "../middlewares/updateValidation.middleware.js";
const router = express.Router();

router.post("/rider/request-ride", verifyRiderLogin, requestRide);
//getting requested trip's info for waiting page
router.get("/rider/get-directions", verifyRiderLogin, getDirections);
//canceling ride
router.post("/rider/cancel-ride", verifyRiderLogin, cancelRide);
//show rider history
router.get("/rider/get-history", verifyRiderLogin, getRiderHistory);
//show rider profile
router.get("/rider/get-profile", verifyRiderLogin, getRiderProfile);
//submit rider review
router.post("/rider/ride-review", verifyRiderLogin, riderRideReview);
router.post(
  "/rider/update-profile",
  validateUpdateProfile,
  verifyRiderLogin,
  updateRiderProfile
);
//update rider profile picture
router.post(
  "/rider/update-profile-picture",
  verifyRiderLogin,
  updateRiderProfilePicture
);

router.get("/rider/history", verifyRiderLogin, getHistory);
router.get("/rider/protected-route", verifyRiderLogin);
router.post("/rider/driver-within-radius", fetchDriverWithinRadius);
router.post("/rider/riderLogout", riderLogout);
router.get(
  "/rider/request/get-directions",
  verifyRiderLogin,
  getRequestDirection
);
export default router;
