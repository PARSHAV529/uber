import express from "express"
import { getHistory } from "../controllers/rider.history.js"
const router = express.Router()

router.get("/rider/history" , getHistory)

export default router