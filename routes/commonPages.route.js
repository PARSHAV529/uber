import express from "express"
import { createProfilePage, forgotPasswordPage, loginPage, otpVarificationPage, signupPage } from "../controllers/commonPages.controller.js";
import { authAlreadyLog, authCreateProfile, authEmail, authSignup } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/signup",authAlreadyLog,authSignup,signupPage)
router.get("/otp-varification",authAlreadyLog,authEmail,otpVarificationPage)
router.get("/login",authAlreadyLog,loginPage)
router.get('/forgot-password',forgotPasswordPage)
router.get("/create-profile",authAlreadyLog,authCreateProfile,createProfilePage)

export default router;