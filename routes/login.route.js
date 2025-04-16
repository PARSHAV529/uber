import express from 'express';
import { forgotPassword, loginUser, updatePassword } from '../controllers/login.controller.js';
import { loginValidation } from '../middlewares/validation.middleware.js';
const router = express.Router();

router.route('/login').post(loginValidation,loginUser);
router.route('/forgot-password').post(forgotPassword)
router.route('/update-password').post(updatePassword)

export default router;