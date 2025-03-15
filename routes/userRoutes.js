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
    loginUser, 
    getUserProfile 
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

//  User Registration Route
router.post("/register", registerUser);

//  User Login Route
router.post("/login", loginUser);

//  Get User Profile (Authenticated Users Only)
router.get("/profile", authenticate, getUserProfile);

export default router;
