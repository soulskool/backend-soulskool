


// controllers/userController.js
import { validationResult } from 'express-validator';
import userModel from '../models/userModel.js';
import axios from 'axios';
import { client as redis } from "../config/redisClient.js";

import { sendWhatsAppTemplate } from '../services/watiService.js';
import crypto from "crypto";
import Otp from '../models/Otp.js';
import QRCode from 'qrcode';
 import jwt from "jsonwebtoken";
 import dotenv from 'dotenv';
dotenv.config();

// Generate a random alphanumeric code
const generateUniqueId = () => crypto.randomBytes(4).toString("hex");






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

    const { phoneNumber, otp, name, email, referredBy } = req.body;

    // Find the OTP entry
    const otpRecord = await Otp.findOne({ phoneNumber, otp });
    
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid OTP or OTP expired" 
      });
    }

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
        
        
        setImmediate(async () => {
          try {
            await userModel.findByIdAndUpdate(referrer._id, {
              $inc: { 
                points: 10,
                totalInvites: 1
              }
            });
            
            
          } catch (error) {
            
          }
        });
      }
    }

    // Save the new user
    await newUser.save();
    
    // Generate token for new user
    const token = generateToken(newUser._id);
    
    // Delete the OTP since it's verified and used - moved to background
    setImmediate(async () => {
      try {
        await Otp.deleteMany({ phoneNumber });
        
      } catch (error) {
        
      }
    });

    // Return response immediately with user data
    res.status(201).json({ 
      success: true, 
      message: "User registered successfully", 
      token,
      userData: {
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        points: newUser.points,
        referralCode: newUser.referralCode,
        referralLink: newUser.referralLink,
        qrCode: newUser.qrCode
      }
    });

    // Run WhatsApp templates in sequence using a single setImmediate to ensure order
    setImmediate(async () => {
      try {
        // First send viralloop template
        await sendWhatsAppTemplate(phoneNumber, 'first_template_viralloop', []);
        
        
        // Then send welcome template
        await sendWhatsAppTemplate(phoneNumber, 'welcome_message_registration', [
          { name: '1', value: name },
          { name: '2', value: referralLink }
        ]);
        
      } catch (error) {
        console.error("❌ Error sending WhatsApp templates:", error.message);
      }
    });


    setImmediate(async () => {
      try {
        const currentDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
        const pabblyResponse = await axios.post(
          'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjYwNTY5MDYzZTA0MzM1MjY4NTUzMTUxMzUi_pc', 
          { 
            name, 
            phoneNumber,  
            email,
            date: currentDate
          }
        );
      } catch (pabblyError) {
        
      }
    });

    
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};


















