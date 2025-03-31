


// controllers/userController.js
import { validationResult } from 'express-validator';
import userModel from '../models/userModel.js';

import { sendWhatsAppTemplate } from '../services/watiService.js';
import crypto from "crypto";
import Otp from '../models/Otp.js';
import QRCode from 'qrcode';
 import jwt from "jsonwebtoken";
 import dotenv from 'dotenv';
dotenv.config();

// Generate a random alphanumeric code
const generateUniqueId = () => crypto.randomBytes(4).toString("hex");
console.log(process.env.JWT_SECRET)





// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
    { expiresIn: '30d' } // Token expires in 30 days
  );
};





// Modified registerUser function with token
export const registerUser = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phoneNumber, name, referredBy } = req.body;

    // Check if User Already Exists in main user collection
    const existingUser = await userModel.findOne({ phoneNumber }).lean();
    if (existingUser) {
      // User already exists, return user data for auto-login
      // Generate token for existing user
      const token = generateToken(existingUser._id);
      
      return res.status(200).json({ 
        success: true, 
        message: "User already registered", 
        isVerified: true,
        token,
        userData: {
          name: existingUser.name,
          phoneNumber: existingUser.phoneNumber,
          points: existingUser.points,
          referralCode: existingUser.referralCode,
          referralLink: existingUser.referralLink,
          yearOfBirth: existingUser.yearOfBirth,
          place: existingUser.place,
          gender: existingUser.gender,
          totalInvites: existingUser.totalInvites,
          level: existingUser.level,
          qrCode: existingUser.qrCode
        }
      });
    }

    // Rest of the function remains the same...
    // Generate OTP (6 digit random number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete any existing OTPs for this number
    await Otp.deleteMany({ phoneNumber });
    
    // Create new OTP entry
    await Otp.create({
      phoneNumber,
      otp
    });
    
    // Send WhatsApp verification message with OTP
    try {
      await sendWhatsAppTemplate(phoneNumber, 'register_otp', [
        { name: '1', value: otp }
      ]);
          } catch (error) {
            // Continue the process even if WhatsApp sending fails
    }

    res.status(200).json({
      success: true,
      message: "✅ OTP sent. Please verify your number via WhatsApp",
      isVerified: false,
      phoneNumber
    });

  } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};







export const verifyOtpAndRegister = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { phoneNumber, otp, name, referredBy } = req.body;

    // Find the OTP entry
    const otpRecord = await Otp.findOne({ phoneNumber, otp });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP or OTP expired" 
      });
    }

    // Check if user already exists (double check)
    const existingUser = await userModel.findOne({ phoneNumber }).lean();
    if (existingUser) {
      // Delete the OTP since it's verified
      await Otp.deleteMany({ phoneNumber });
      
      // Generate token for existing user
      const token = generateToken(existingUser._id);
      
      return res.status(200).json({ 
        success: true, 
        message: "User already registered", 
        token,
        userData: {
          name: existingUser.name,
          phoneNumber: existingUser.phoneNumber,
          points: existingUser.points,
          referralCode: existingUser.referralCode,
          referralLink: existingUser.referralLink,
          qrCode: existingUser.qrCode
        }
      });
    }

    // Continue with user creation...
    // Generate unique referral code with name and random string
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    let referralCode = `${cleanName}_${generateUniqueId()}`;
    
    // Check if referralCode already exists and regenerate if needed
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 5) {
      const existingCode = await userModel.findOne({ referralCode });
      if (!existingCode) {
        isUnique = true;
      } else {
        referralCode = `${cleanName}_${generateUniqueId()}`;
        attempts++;
      }
    }
    
    const frontendUrl = process.env.FRONTEND_URL;
const referralLink = `${frontendUrl}/${referralCode}`;
    
    // Generate QR code as URL
    const qrCodeUrl = await QRCode.toDataURL(referralLink);

    // Create new user
    const newUser = new userModel({
      name,
      phoneNumber,
      referralCode,
      referralLink,
      qrCode: qrCodeUrl, 
      yearOfBirth: null,
      place: null,
      gender: "Other"
    });

    // If referral code provided, process it
    if (referredBy) {
      const referrer = await userModel.findOne({ referralCode: referredBy });
      if (referrer) {
        // Set referrer's referral code in new user
        newUser.referredBy = referrer.referralCode;
        
        // Update referrer's points and total invites
        await userModel.findByIdAndUpdate(referrer._id, {
          $inc: { 
            points: 10,
            totalInvites: 1
          }
        });
        
              } else {
              }
    }

    // Save the new user
    await newUser.save();
    
    // Generate token for new user
    const token = generateToken(newUser._id);
    console.log(token)

    // Delete the OTP since it's verified and used
    await Otp.deleteMany({ phoneNumber });

    // Send welcome message on WhatsApp
    try {
      await sendWhatsAppTemplate(phoneNumber, 'welcome_message_registeration', [
        { name: '1', value: name },
        { name: '2', value: referralLink }
      ]);
          } catch (error) {
            // Continue even if WhatsApp sending fails
    }

    // Return success with user data and token
    res.status(201).json({
      success: true, 
      message: "✅ Registration successful!",
      token,
      userData: {
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        points: newUser.points,
        referralCode: newUser.referralCode,
        referralLink: newUser.referralLink,
        totalInvites: newUser.totalInvites,
          level: newUser.level,
        qrCode: newUser.qrCode
      }
    });

  } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};










// 🔹 Resend OTP if needed
export const resendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete any existing OTPs for this number
    await Otp.deleteMany({ phoneNumber });
    
    // Create new OTP entry
    await Otp.create({
      phoneNumber,
      otp
    });
    
    // Send WhatsApp message with OTP
    try {
      await sendWhatsAppTemplate(phoneNumber, 'profile_update__otp', [
        { name: 'otp', value: otp }
      ]);
          } catch (error) {
            // Continue the process even if WhatsApp sending fails
    }

    res.status(200).json({
      success: true,
      message: "✅ OTP resent successfully",
      phoneNumber
    });
    
  } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};



















