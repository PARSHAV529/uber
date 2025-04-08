import express from "express";
import {
  getDriverProfileData,
  getRideRequest,
  postDriverEarningsDates,
  postDriverProfileData,
} from "../controllers/driver.controller.js";

const router = express.Router();

// import {
//   getRideRequest,
//   getDriverEarnings,
//   getDriverPaymentPageData,
//   getAllRides,
//   getNotifiationDetails,
// } from "../controllers/driver.controller.js";
router.get("/driver/ride-request",getRideRequest)

import { getDriverEarnings, getDriverPaymentPageData, getAllRides, getNotifiationDetails } from "../controllers/driver.controller.js";
import { handleDriverDocument } from "../middlewares/handleDriverDocumentmulter.middleware.js";
import { handleDriverDocumentCloudinary } from "../middlewares/handleDriverDocumentCloudinary.middleware.js";

router.get("/driver/get-ride-request", getRideRequest);
router.get("/driver/payments-data", getDriverPaymentPageData);
router.get("/driver/earnings-data", getDriverEarnings);
import {
  generateQR,
  getrideDetails,
} from "../controllers/driver.controller.js";

// router.get("/driver/ride-request", rideRequest);
router.get("/driver/ride-request/:id", getrideDetails);

router.get("/driver/payments-data",getDriverPaymentPageData )
router.get("/driver/earnings-data",getDriverEarnings)
router.post("/driver/dates",postDriverEarningsDates)
router.get("/driver/profile-data",getDriverProfileData)
router.post("/driver/profile-data",handleDriverDocument.single('document'),handleDriverDocumentCloudinary,postDriverProfileData)

router.get("/all-rides/:dId?/:r_type?", getAllRides);
router.post("/get-notification-details", getNotifiationDetails);
router.get("/generate-qr-code", generateQR);



export default router;
