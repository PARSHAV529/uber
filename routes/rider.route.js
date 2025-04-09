import express from "express";
import { getHistory } from "../controllers/rider.history.js";
import { verifyRiderLogin } from "../middlewares/rider.middleware.js";
const router = express.Router();

router.get("/rider/history", getHistory);
router.get("/rider/protected-route", verifyRiderLogin);
export default router;
