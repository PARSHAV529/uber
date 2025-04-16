import express from "express";
import {
  completeRide,
  driverSidebarProfile,
  getDriverProfileData,
  getNotificationCnt,
  getRideRequest,
  monthlySummary,
  postDriverEarningsDates,
  postDriverProfileData,
  updateDriverStatus,
  updateNotificatonCnt,
} from "../controllers/driver.controller.js";

const router = express.Router();

// import {
//   getRideRequest,
//   getDriverEarnings,
//   getDriverPaymentPageData,
//   getAllRides,
//   getNotifiationDetails,
// } from "../controllers/driver.controller.js";

import {
  getDriverEarnings,
  getDriverPaymentPageData,
  getAllRides,
  getNotifiationDetails,
} from "../controllers/driver.controller.js";
import { handleDriverDocument } from "../middlewares/handleDriverDocumentmulter.middleware.js";
import { handleDriverDocumentCloudinary } from "../middlewares/handleDriverDocumentCloudinary.middleware.js";

router.get("/driver/get-ride-request", authDriver, getRideRequest);
import {
  generateQR,
  getrideDetails,
} from "../controllers/driver.controller.js";
import { activerRideDetail } from "../controllers/ride.controller.js";
import { authDriver } from "../middlewares/auth.middleware.js";

// router.get("/driver/ride-request", rideRequest);
router.get("/driver/ride-request/:id", authDriver, getrideDetails);

router.get("/driver/payments-data", authDriver, getDriverPaymentPageData)
router.get("/driver/earnings-data", authDriver, getDriverEarnings)
router.post("/driver/dates", authDriver, postDriverEarningsDates)
router.get("/driver/profile-data", authDriver, getDriverProfileData)
router.post("/driver/profile-data", authDriver, handleDriverDocument.single('document'), handleDriverDocumentCloudinary, postDriverProfileData)
router.get("/all-rides/:dId?/:r_type?", authDriver, getAllRides);
router.get("/generate-qr-code/:amount?", authDriver, generateQR);
router.get("/updateStatus/:status?/:d_id?", authDriver, updateDriverStatus)
router.get("/driver/active-ride/:driver_id?", authDriver, activerRideDetail)
router.get("/complete-ride/:ride_id?/:mode?/:amount?", authDriver, completeRide)
router.post('/update-notification-count/:id' , authDriver , updateNotificatonCnt)
router.post("/get-notification-details", authDriver, getNotifiationDetails);
router.post("/get-notification-count", authDriver, getNotificationCnt);
router.get("/driver-sidebar-profile",authDriver,driverSidebarProfile)
router.get("/monthly-summary/:dId?",monthlySummary)

export default router;
