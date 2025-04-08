import express from 'express';
import { forgotPassword, loginUser, updatePassword } from '../controllers/login.controller.js';
const router = express.Router();

router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword)
router.route('/update-password').post(updatePassword)

export default router;