import express from "express";
import {
  adminLogin,
  dashboard,
  documents,
  reports,
  docVerification,
  allUsers,
  adminDriverProfile,
} from "../controllers/adminPages.controller.js";

const router = express.Router();

router.get("/login", adminLogin);
router.get("/", dashboard);
router.get("/documents", documents);
router.get("/reports", reports);
router.get("/doc-verification", docVerification);
router.get("/users", allUsers);
router.get("/driver-detail", adminDriverProfile);

export default router;
