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




























// // controllers/userController.js
// import { validationResult } from 'express-validator';
// import userModel from '../models/userModel.js';

// import { sendWhatsAppTemplate } from '../services/watiService.js';
// import crypto from "crypto";
// import Otp from '../models/Otp.js';
// import QRCode from 'qrcode';


// import {createReferralLink} from './referralController.js';

// // Generate a random alphanumeric code
// const generateUniqueId = () => crypto.randomBytes(4).toString("hex");

// // 🔹 User Registration with OTP Flow
// export const registerUser = async (req, res) => {
//   try {
//     // Validate input
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const { phoneNumber, name, referredBy } = req.body;

//     // Check if User Already Exists in main user collection
//     const existingUser = await userModel.findOne({ phoneNumber }).lean();
//     if (existingUser) {
//       // User already exists, return user data for auto-login
//       return res.status(200).json({ 
//         success: true, 
//         message: "User already registered", 
//         isVerified: true,
//         userData: {
//           name: existingUser.name,
//           phoneNumber: existingUser.phoneNumber,
//           points: existingUser.points,
//           referralCode: existingUser.referralCode,
//           referralLink: existingUser.referralLink,
//           yearOfBirth: existingUser.yearOfBirth,
//           place: existingUser.place,
//           gender: existingUser.gender,
//           totalInvites: existingUser.totalInvites,
//           rank: existingUser.rank,
//           level: existingUser.level,
//           qrCode: existingUser.qrCode
//         }
//       });
//     }

//     // Generate OTP (6 digit random number)
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
//     // Delete any existing OTPs for this number
//     await Otp.deleteMany({ phoneNumber });
    
//     // Create new OTP entry
//     await Otp.create({
//       phoneNumber,
//       otp
//     });
    
//     // Send WhatsApp verification message with OTP
//     try {
//       await sendWhatsAppTemplate(phoneNumber, 'profile_update__otp', [
//         { name: '1', value: otp }
//       ]);
//       console.log(`✅ OTP sent to ${phoneNumber}`);
//     } catch (error) {
//       console.error("❌ Failed to send OTP:", error);
//       // Continue the process even if WhatsApp sending fails
//     }

//     res.status(200).json({
//       success: true,
//       message: "✅ OTP sent. Please verify your number via WhatsApp",
//       isVerified: false,
//       phoneNumber
//     });

//   } catch (error) {
//     console.error("❌ Registration Error:", error.message);
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };








// // 🔹 Verify OTP and Complete Registration
// export const verifyOtpAndRegister = async (req, res) => {
//   try {
//     // Validate input
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const { phoneNumber, otp, name, referredBy } = req.body;

//     // Find the OTP entry
//     const otpRecord = await Otp.findOne({ phoneNumber, otp });
    
//     if (!otpRecord) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid OTP or OTP expired" 
//       });
//     }

//     // Check if user already exists (double check)
//     const existingUser = await userModel.findOne({ phoneNumber }).lean();
//     if (existingUser) {
//       // Delete the OTP since it's verified
//       await Otp.deleteMany({ phoneNumber });
      
//       return res.status(200).json({ 
//         success: true, 
//         message: "User already registered", 
//         isVerified: true,
//         userData: {
//           name: existingUser.name,
//           phoneNumber: existingUser.phoneNumber,
//           points: existingUser.points,
//           referralCode: existingUser.referralCode,
//           referralLink: existingUser.referralLink,
//           qrCode: existingUser.qrCode
//         }
//       });
//     }

//     // Generate unique referral code with name and random string
//     // Clean the name (remove spaces, special chars) and get first part

//     // const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
//     // let referralCode = `${cleanName}_${generateUniqueId()}`;

   
//     // Check if referralCode already exists and regenerate if needed
//     let isUnique = false;
//     let attempts = 0;
    
//     while (!isUnique && attempts < 5) {
//       const existingCode = await userModel.findOne({ referralCode });
//       if (!existingCode) {
//         isUnique = true;
//       } else {
//         referralCode = `${cleanName}_${generateUniqueId()}`;
//         attempts++;
//       }
//     }
    
//     // Generate referral link
//     // const referralLink = `https://localhost:3001.com/${referralCode}`;
    
  

//     // Generate QR code as URL
//     const qrCodeUrl = await QRCode.toDataURL(referralLink);

//     // Create new user
//     const newUser = new userModel({
//       name,
//       phoneNumber,
//       referralCode,
//       referralLink,
//       qrCode: qrCodeUrl, // Store the QR code URL
//       isVerified: true,
//       // These fields will need to be updated later in profile completion
//       yearOfBirth: new Date().getFullYear() - 18, // Default value
//       place: "Not specified",
//       gender: "Other"
//     });

//     // If referral code provided, process it
//     if (referredBy) {
//       const referrer = await userModel.findOne({ referralCode: referredBy });
//       if (referrer) {
//         // Set referrer in new user
//         newUser.referredBy = referrer._id;
        
//         // Update referrer's points and total invites
//         await userModel.findByIdAndUpdate(referrer._id, {
//           $inc: { 
//             points: 10,
//             totalInvites: 1
//           }
//         });
        
//         console.log(`✅ Referral processed: ${referrer.name} (+10 points)`);
//       } else {
//         console.log(`❌ Invalid referral code: ${referredBy}`);
//       }
//     }

//     // Save the new user
//     await newUser.save();
    
//     // Delete the OTP since it's verified and used
//     await Otp.deleteMany({ phoneNumber });

//     // Send welcome message on WhatsApp
//     try {
//       await sendWhatsAppTemplate(phoneNumber, 'welcome_message_registeration', [
//         { name: '1', value: name },
//         { name: '2', value: referralLink }
//       ]);
//       console.log(`✅ Welcome message sent to ${phoneNumber}`);
//     } catch (error) {
//       console.error("❌ Failed to send welcome message:", error);
//       // Continue even if WhatsApp sending fails
//     }

//     // Return success with user data
//     res.status(201).json({
//       success: true, 
//       message: "✅ Registration successful!",
//       isVerified: true,
//       userData: {
//         name: newUser.name,
//         phoneNumber: newUser.phoneNumber,
//         points: newUser.points,
//         referralCode: newUser.referralCode,
//         referralLink: newUser.referralLink,
//         qrCode: newUser.qrCode
//       }
//     });

//   } catch (error) {
//     console.error("❌ OTP Verification Error:", error.message);
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };











// // 🔹 Resend OTP if needed
// export const resendOtp = async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;
    
//     // Generate new OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
//     // Delete any existing OTPs for this number
//     await Otp.deleteMany({ phoneNumber });
    
//     // Create new OTP entry
//     await Otp.create({
//       phoneNumber,
//       otp
//     });
    
//     // Send WhatsApp message with OTP
//     try {
//       await sendWhatsAppTemplate(phoneNumber, 'profile_update__otp', [
//         { name: 'otp', value: otp }
//       ]);
//       console.log(`✅ OTP resent to ${phoneNumber}`);
//     } catch (error) {
//       console.error("❌ Failed to resend OTP:", error);
//       // Continue the process even if WhatsApp sending fails
//     }

//     res.status(200).json({
//       success: true,
//       message: "✅ OTP resent successfully",
//       phoneNumber
//     });
    
//   } catch (error) {
//     console.error("❌ Resend OTP Error:", error.message);
//     res.status(500).json({ success: false, message: "Server Error", error: error.message });
//   }
// };





import { validationResult } from "express-validator";
import userModel from "../models/userModel.js";
import { sendWhatsAppTemplate } from "../services/watiService.js";
import crypto from "crypto";
import Otp from "../models/Otp.js";
import QRCode from "qrcode";
import { createReferralLink } from "../controllers/referralController.js"; // ✅ Import referral functions

// Generate a random alphanumeric code
const generateUniqueId = () => crypto.randomBytes(4).toString("hex");

// 🔹 Register User with OTP
export const registerUser = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phoneNumber, name } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ phoneNumber }).lean();
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "User already registered",
        isVerified: true,
        userData: existingUser,
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete existing OTPs and create a new one
    await Otp.deleteMany({ phoneNumber });
    await Otp.create({ phoneNumber, otp });

    // Send OTP via WhatsApp
    try {
      await sendWhatsAppTemplate(phoneNumber, "profile_update__otp", [
        { name: "1", value: otp },
      ]);
      console.log(`✅ OTP sent to ${phoneNumber}`);
    } catch (error) {
      console.error("❌ Failed to send OTP:", error);
    }

    res.status(200).json({
      success: true,
      message: "✅ OTP sent. Please verify your number via WhatsApp",
      isVerified: false,
      phoneNumber,
    });

  } catch (error) {
    console.error("❌ Registration Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// 🔹 Verify OTP & Complete Registration
export const verifyOtpAndRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phoneNumber, otp, name, referredBy } = req.body;

    // Validate OTP
    const otpRecord = await Otp.findOne({ phoneNumber, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid OTP or OTP expired" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ phoneNumber }).lean();
    if (existingUser) {
      await Otp.deleteMany({ phoneNumber });
      return res.status(200).json({
        success: true,
        message: "User already registered",
        isVerified: true,
        userData: existingUser,
      });
    }

    // Generate Unique Referral Code
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10);
    let referralCode = `${cleanName}_${generateUniqueId()}`;

    // Ensure referralCode is unique
    let attempts = 0;
    while (await userModel.findOne({ referralCode }) && attempts < 5) {
      referralCode = `${cleanName}_${generateUniqueId()}`;
      attempts++;
    }

    // Create New User
    const newUser = new userModel({
      name,
      phoneNumber,
      referralCode,
      isVerified: true,
      yearOfBirth: new Date().getFullYear() - 18,
      place: "Not specified",
      gender: "Other",
    });

    // Save new user before generating referral link
    await newUser.save();

    // Generate Referral Link
    const referralLink = await createReferralLink(newUser._id);
    
    // Generate QR Code for referral link
    const qrCodeUrl = await QRCode.toDataURL(referralLink);

    // Update user with referral link & QR code
    await userModel.findByIdAndUpdate(newUser._id, {
      referralLink,
      qrCode: qrCodeUrl,
    });

    // If referred by someone, process referral
    if (referredBy) {
      const referrer = await userModel.findOne({ referralCode: referredBy });
      if (referrer) {
        newUser.referredBy = referrer._id;

        // Update referrer's points & invites count
        await userModel.findByIdAndUpdate(referrer._id, {
          $inc: { points: 10, totalInvites: 1 },
        });

        console.log(`✅ Referral processed: ${referrer.name} (+10 points)`);
      } else {
        console.log(`❌ Invalid referral code: ${referredBy}`);
      }
    }

    // Send WhatsApp welcome message
    try {
      await sendWhatsAppTemplate(phoneNumber, "welcome_message_registeration", [
        { name: "1", value: name },
        { name: "2", value: referralLink },
      ]);
      console.log(`✅ Welcome message sent to ${phoneNumber}`);
    } catch (error) {
      console.error("❌ Failed to send welcome message:", error);
    }

    // Respond with user data
    res.status(201).json({
      success: true,
      message: "✅ Registration successful!",
      isVerified: true,
      userData: {
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        referralCode: newUser.referralCode,
        referralLink,
        qrCode: qrCodeUrl,
      },
    });

  } catch (error) {
    console.error("❌ OTP Verification Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// 🔹 Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete any existing OTPs
    await Otp.deleteMany({ phoneNumber });
    await Otp.create({ phoneNumber, otp });

    // Send WhatsApp message with OTP
    try {
      await sendWhatsAppTemplate(phoneNumber, "profile_update__otp", [
        { name: "otp", value: otp },
      ]);
      console.log(`✅ OTP resent to ${phoneNumber}`);
    } catch (error) {
      console.error("❌ Failed to resend OTP:", error);
    }

    res.status(200).json({
      success: true,
      message: "✅ OTP resent successfully",
      phoneNumber,
    });

  } catch (error) {
    console.error("❌ Resend OTP Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


















