


import express from "express";
import { 
    registerUser, 
    verifyOtpAndRegister
} from "../controllers/userController.js";
import { authMiddleware } from '../middleware/authMiddleware.js';
import { generateProfileUpdateOtp, verifyOtpAndUpdateProfile } from '../controllers/profileController.js';

import{getUserRank,getUserInfo,getReferredUsers} from '../controllers/getUserDetails.js'

const router = express.Router();

//  User Registration Route
router.post("/register", registerUser);
router.post("/register/verify-otp",verifyOtpAndRegister)




router.get('/user-rank/:phoneNumber', getUserRank);
router.get('/user-info/:phoneNumber', getUserInfo);







router.get('/:referralCode/referred-users',getReferredUsers)



// Route to generate and send OTP for profile update
router.post('/generate-update-otp',authMiddleware, generateProfileUpdateOtp);

// Route to verify OTP and update profile
router.post('/verify-update-otp',authMiddleware, verifyOtpAndUpdateProfile);




export default router;
