// import express from "express";
// import User from "../models/User.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// /**
//  * @route  GET /api/profile
//  * @desc   Get user profile
//  * @access Private
//  */
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(user);
//   } catch (error) {
//     //     res.status(500).json({ message: "Server Error" });
//   }
// });

// /**
//  * @route  PUT /api/profile
//  * @desc   Update user profile
//  * @access Private
//  */
// router.put("/", authMiddleware, async (req, res) => {
//   try {
//     const { name, yearOfBirth, place, gender, qrCode } = req.body;

//     const updatedFields = {};
//     if (name) updatedFields.name = name;
//     if (yearOfBirth) updatedFields.yearOfBirth = yearOfBirth;
//     if (place) updatedFields.place = place;
//     if (gender) updatedFields.gender = gender;
//     if (qrCode) updatedFields.qrCode = qrCode;

//     const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedFields, { new: true }).select("-password");

//     res.json(updatedUser);
//   } catch (error) {
//     //     res.status(500).json({ message: "Server Error" });
//   }
// });

// export default router;


import express from "express";
import User from "../models/userModel.js";
import { authenticate } from "../middleware/auth.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Store OTPs in-memory (Use Redis in production)
const otpStorage = {};

/**
 * @route  GET /api/profile
 * @desc   Get user profile
 * @access Private
 */
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }
    res.json(user);
  } catch (error) {
        res.status(500).json({ message: "❌ Server Error" });
  }
});

/**
 * @route  POST /api/profile/request-otp
 * @desc   Request OTP for profile update
 * @access Private
 */



router.post("/profile/request-otp", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage[user.phoneNumber] = otp;

    // Send OTP via WATI API
    const response = await axios.post(
      "https://api.wati.io/v1/sendSessionMessage",
      {
        phone: user.phoneNumber,
        message: `🔢 Your OTP for profile update is: ${otp}. It is valid for 10 minutes. Do not share with anyone.`
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WATI_API_KEY}`
        }
      }
    );

    res.json({ success: true, message: "📲 OTP sent via WhatsApp", otp }); // ⚠️ Remove OTP from response in production
  } catch (error) {
        res.status(500).json({ message: "❌ Error sending OTP" });
  }
});

/**
 * @route  PUT /api/profile/update-profile
 * @desc   Update user profile (OTP Required)
 * @access Private
 */
router.put("/profile/update-profile", authenticate, async (req, res) => {
  try {
    const { name, yearOfBirth, place, gender, qrCode, otp } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    // Validate OTP
    if (!otp || otpStorage[user.phoneNumber] !== otp) {
      return res.status(400).json({ message: "❌ Invalid or expired OTP" });
    }

    // Remove OTP after verification (for security)
    delete otpStorage[user.phoneNumber];

    // Update fields
    if (name) user.name = name;
    if (yearOfBirth) user.yearOfBirth = yearOfBirth;
    if (place) user.place = place;
    if (gender) user.gender = gender;
    if (qrCode) user.qrCode = qrCode;

    await user.save();
    res.json({ success: true, message: "✅ Profile updated successfully", user });
  } catch (error) {
        res.status(500).json({ message: "❌ Server Error" });
  }
});

export default router;

