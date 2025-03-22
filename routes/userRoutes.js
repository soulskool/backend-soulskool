// import express from "express";
// import { registerUser, loginUser, getUserProfile } from "../controllers/userController.js";
// import { authenticate } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // User Registration Route
// router.post("/register", registerUser);

// // User Login Route
// router.post("/login", loginUser);

// // Get User Profile (Protected Route)
// router.get("/profile", authenticate, getUserProfile);

// export default router;


import express from "express";
import { 
    registerUser, 
    verifyOtpAndRegister
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { generateProfileUpdateOtp, verifyOtpAndUpdateProfile } from '../controllers/profileController.js';
import{testWelcomeTemplate} from '../controllers/testWelcomeTemplate.js'
import{getUserRank,getUserInfo} from '../controllers/getUserDetails.js'

const router = express.Router();

//  User Registration Route
router.post("/register", registerUser);
router.post("/register/verify-otp",verifyOtpAndRegister)




router.get('/user-rank/:phoneNumber', getUserRank);
router.get('/user-info/:phoneNumber', getUserInfo);



router.post("/testwelcometemplate",testWelcomeTemplate )










// Route to generate and send OTP for profile update
router.post('/generate-update-otp', generateProfileUpdateOtp);

// Route to verify OTP and update profile
router.post('/verify-update-otp', verifyOtpAndUpdateProfile);




export default router;
