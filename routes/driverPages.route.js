import express from "express";
import {
  drievrRideAccept,
  driverDocumentsPage,
  driverHistoryPage,
  driverHomePage,
  driverLandingPage,
  driverNotificationsPage,
  driverPaymentsPage,
  driverProfilePage,
  driverQrPage,
  driverRidesPage,
  driverSettingPage,
} from "../controllers/driverPages.controller.js";
import { authAlreadyLog, authDriver } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authAlreadyLog,driverLandingPage);
router.get("/home", authDriver, driverHomePage);
router.get("/rides", authDriver, driverRidesPage);
router.get("/payments", authDriver, driverPaymentsPage);
router.get("/history", authDriver, driverHistoryPage);
router.get("/settings", authDriver, driverSettingPage);
router.get("/notifications", authDriver, driverNotificationsPage);
router.get("/profile", authDriver, driverProfilePage);
router.get("/qr-page", authDriver, driverQrPage);
router.get("/upload-documents", authDriver, driverDocumentsPage);
router.get("/ride-accepted", authDriver, drievrRideAccept);

export default router;
