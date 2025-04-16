import express from "express";
import {
  rideRequestPage,
  riderHistoryPage,
  riderPrivacyPage,
  riderProfilePage,
  riderRideAcceptedPage,
  riderRideSetupPage,
  riderSecurityPage,
  aboutus,
} from "../controllers/riderPages.controller.js";
import { verifyRiderLogin } from "../middlewares/rider.middleware.js";

const router = express.Router();

router.get("/go/:start?/:dest?", verifyRiderLogin, riderRideSetupPage);
router.get("/request", verifyRiderLogin, rideRequestPage);
router.get("/history", verifyRiderLogin, riderHistoryPage);
router.get("/profile", verifyRiderLogin, riderProfilePage);
router.get("/security", verifyRiderLogin, riderSecurityPage);
router.get("/privacy", verifyRiderLogin, riderPrivacyPage);
router.get("/accepted", verifyRiderLogin, riderRideAcceptedPage);
router.get("/aboutus", aboutus);

export default router;
