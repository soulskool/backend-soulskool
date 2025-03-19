// import userModel from "../models/userModel.js";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import { body, validationResult } from "express-validator";
// import crypto from "crypto";

// dotenv.config();

// // 🔹 Middleware: Validate User Input
// export const validateUser = [
//   body("name").trim().notEmpty().withMessage("Name is required"),
//   body("phoneNumber")
//     .isMobilePhone()
//     .withMessage("Valid phone number is required"),
// ];

// // 🔹 Generate Secure Referral Code
// const generateReferralCode = () => crypto.randomBytes(3).toString("hex");




// // 🔹 User Registration (ReferredBy is Optional)
// export const registerUser = async (req, res) => {
//   try {
//     // Validate input
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const { name, phoneNumber, referredBy } = req.body;

//     // Check if User Already Exists
//     const existingUser = await userModel.findOne({ phoneNumber }).lean();
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: "User already registered" });
//     }

//     // Generate Referral Code & Link
//     const referralCode = generateReferralCode();
//     console.log("Generated referral code:", referralCode); // 🔍 Debugging
//     const referralLink = `https://learn.anyonecandance.in/acd/free-trial/y/${name.replace(/\s/g, "").toLowerCase()}_${referralCode}`;

//     let referredByUser = null;

//     // If referredBy is provided, validate it
//     if (referredBy) {
//       referredByUser = await userModel.findOne({ referralCode: referredBy }).lean();

//       console.log("🔎 Received referredBy:", referredBy);
//       console.log("🔎 Found referredByUser:", referredByUser);

//       if (!referredByUser) {
//         return res.status(400).json({ success: false, message: "Invalid referral code" });
//       }
//     }

//     // Create User
//     const newUser = await userModel.create({
//       name,
//       phoneNumber,
//       referralCode,
//       referralLink,
//       referredBy: referredByUser ? referredByUser._id : null, // Store ObjectId if referred
//       points: 0, // Initialize points
//     });

//     // Reward Referral Points (Only if valid referredBy exists)
//     if (referredByUser) {
//       await userModel.findByIdAndUpdate(
//         referredByUser._id,
//         { $inc: { points: 50 } }, // Reward referrer
//         { new: true }
//       );
//     }

//     res.status(201).json({
//       success: true,
//       message: "✅ User registered successfully",
//       referralLink: newUser.referralLink,
//     });

//   } catch (error) {
//     console.error("❌ Registration Error:", error.message);
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };











// // 🔹 User Login
// export const loginUser = async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;

//     if (!phoneNumber || !/^\d{10,15}$/.test(phoneNumber)) {
//       return res.status(400).json({ success: false, message: "Invalid phone number" });
//     }

//     const user = await userModel.findOne({ phoneNumber }).lean();
//     if (!user) {
//       return res.status(400).json({ success: false, message: "User not found" });
//     }

//     // Generate JWT Token (Stored Securely in HTTP-Only Cookie)
//     const token = jwt.sign(
//       { userId: user._id, role: user.isAdmin ? "admin" : "user" },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.cookie("authToken", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
//     });

//     res.status(200).json({
//       success: true,
//       message: "✅ Login Successful",
//       token,
//       user: {
//         name: user.name,
//         phoneNumber: user.phoneNumber,
//         referralLink: user.referralLink,
//         points: user.points,
//       },
//     });

//   } catch (error) {
//     console.error("❌ Login Error:", error.message);
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// // 🔹 Get User Profile (Authenticated)
// export const getUserProfile = async (req, res) => {
//   try {
//     const user = await userModel.findById(req.user.userId).select("-__v").lean();

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({
//       success: true,
//       user: {
//         name: user.name,
//         phoneNumber: user.phoneNumber,
//         referralLink: user.referralLink,
//         referredBy: user.referredBy,
//         points: user.points,
//       },
//     });

//   } catch (error) {
//     console.error("❌ Profile Fetch Error:", error.message);
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };

// // 🔹 Logout User
// export const logoutUser = (req, res) => {
//   res.clearCookie("authToken", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//   });

//   res.status(200).json({ success: true, message: "✅ Logout successful" });
// };

// // 🔹 Get Referral Leaderboard (Top Users)
// export const getReferralLeaderboard = async (req, res) => {
//   try {
//     const topUsers = await userModel.find().sort({ points: -1 }).limit(10).select("name points referralCode").lean();

//     res.status(200).json({
//       success: true,
//       leaderboard: topUsers,
//     });

//   } catch (error) {
//     console.error("❌ Leaderboard Error:", error.message);
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };






















// controllers/userController.js
import { validationResult } from 'express-validator';
import userModel from '../models/userModel.js';
import verificationModel from '../models/verificationModel.js';
import { sendWhatsAppTemplate } from '../services/watiService.js';

// Generate a random alphanumeric code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// 🔹 User Registration (ReferredBy is Optional)
export const registerUser = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phoneNumber, referredBy } = req.body;

    // Check if User Already Exists in main user collection
    const existingUser = await userModel.findOne({ phoneNumber }).lean();
    if (existingUser) {
      // User already exists, return user data for auto-login
      return res.status(200).json({ 
        success: true, 
        message: "User already registered", 
        isVerified: true,
        userData: {
          name: existingUser.name,
          phoneNumber: existingUser.phoneNumber,
          points: existingUser.points,
          referralCode: existingUser.referralCode,
          referralLink: existingUser.referralLink
        }
      });
    }

    // Check if verification already pending  Need to remove this or update
    const pendingVerification = await verificationModel.findOne({ phoneNumber }).lean();
    
    if (pendingVerification) {
      // Verification already sent, return status
      return res.status(200).json({ 
        success: true, 
        message: "Verification already sent", 
        isVerified: false,
        phoneNumber
      });
    }

    console.log(`refered code by login user ${referredBy}`)
    // If no existing user or pending verification, create a new verification entry

    await verificationModel.create({
      name,
      phoneNumber,
      referredBy: referredBy || null,
      isVerified: false
    });
    
    // Send WhatsApp verification message
    try {
      await sendWhatsAppTemplate(phoneNumber, 'verification_message', [
        { name: 'name', value: name }
      ]);
      console.log(`✅ Verification template sent to ${phoneNumber}`);
    } catch (error) {
      console.error("❌ Failed to send verification template:", error);
      // Continue the process even if WhatsApp sending fails
    }

    res.status(200).json({
      success: true,
      message: "✅ Verification sent. Please verify your account via WhatsApp",
      isVerified: false,
      phoneNumber
    });

  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// 🔹 Check Verification Status
export const checkVerificationStatus = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    // Check if user exists in main user collection
    const existingUser = await userModel.findOne({ phoneNumber }).lean();
    if (existingUser) {
      return res.status(200).json({ 
        success: true, 
        isVerified: true,
        userData: {
          name: existingUser.name,
          phoneNumber: existingUser.phoneNumber,
          points: existingUser.points,
          referralCode: existingUser.referralCode,
          referralLink: existingUser.referralLink
        }
      });
    }
    
    // Check verification status
    const verification = await verificationModel.findOne({ phoneNumber }).lean();
    if (!verification) {
      return res.status(404).json({ 
        success: false, 
        message: "No verification request found",
        isVerified: false
      });
    }
    
    return res.status(200).json({
      success: true,
      isVerified: verification.isVerified,
      message: verification.isVerified ? "Account verified" : "Verification pending"
    });
    
  } catch (error) {
    console.error("❌ Verification Status Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};









// 🔹 User Login
export const loginUser = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || !/^\d{10,15}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    const user = await userModel.findOne({ phoneNumber }).lean();
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Generate JWT Token (Stored Securely in HTTP-Only Cookie)
    const token = jwt.sign(
      { userId: user._id, role: user.isAdmin ? "admin" : "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    res.status(200).json({
      success: true,
      message: "✅ Login Successful",
      token,
      user: {
        name: user.name,
        phoneNumber: user.phoneNumber,
        referralLink: user.referralLink,
        points: user.points,
      },
    });

  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// 🔹 Get User Profile (Authenticated)
export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.userId).select("-__v").lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        phoneNumber: user.phoneNumber,
        referralLink: user.referralLink,
        referredBy: user.referredBy,
        points: user.points,
      },
    });

  } catch (error) {
    console.error("❌ Profile Fetch Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// 🔹 Logout User
export const logoutUser = (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ success: true, message: "✅ Logout successful" });
};

// 🔹 Get Referral Leaderboard (Top Users)
export const getReferralLeaderboard = async (req, res) => {
  try {
    const topUsers = await userModel.find().sort({ points: -1 }).limit(10).select("name points referralCode").lean();

    res.status(200).json({
      success: true,
      leaderboard: topUsers,
    });

  } catch (error) {
    console.error("❌ Leaderboard Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
