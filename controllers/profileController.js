// controllers/profileController.js
import User from '../models/userModel.js';
import Otp from '../models/Otp.js';
import { sendWhatsAppTemplate } from '../services/watiService.js';
import { watiConfig } from '../config/wati.config.js';

/**
 * Generate and send OTP for profile update
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateProfileUpdateOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP in database (will auto-expire in 5 minutes based on schema)
    await Otp.deleteMany({ phoneNumber }); // Delete any existing OTPs for this number
    await Otp.create({ phoneNumber, otp });
    
    // Send OTP via WhatsApp using WATI
    // Using the template with just one parameter (the OTP code)
    const parameters = [
      { name: "1", value: otp }  // Only need to send the OTP code
    ];
    
    await sendWhatsAppTemplate(phoneNumber, "profile_update__otp", parameters);
    
    return res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully to your WhatsApp number'
    });
  } catch (error) {
        return res.status(500).json({ 
      success: false, 
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
};









/**
 * Verify OTP and update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const verifyOtpAndUpdateProfile = async (req, res) => {
    try {
      const { phoneNumber, otp, name, yearOfBirth, gender, place } = req.body;
      
      if (!phoneNumber || !otp) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number and OTP are required' 
        });
      }
      
      // Find the OTP in database
      const otpRecord = await Otp.findOne({ phoneNumber, otp });
      
      if (!otpRecord) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid OTP or OTP expired' 
        });
      }
      
      // Update user profile with provided fields
      const updateFields = {};
      
      if (name) updateFields.name = name;
      if (yearOfBirth) updateFields.yearOfBirth = yearOfBirth;
      if (gender) updateFields.gender = gender;
      if (place) updateFields.place = place;
      
      // Update user profile
      const updatedUser = await User.findOneAndUpdate(
        { phoneNumber },
        updateFields,
        { new: true, runValidators: true }
      );
      
      // Delete the OTP after successful verification
      await Otp.deleteOne({ _id: otpRecord._id });
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          name: updatedUser.name,
          phoneNumber: updatedUser.phoneNumber,
          yearOfBirth: updatedUser.yearOfBirth,
          gender: updatedUser.gender,
          place: updatedUser.place
        }
      });
    } catch (error) {
            return res.status(500).json({ 
        success: false, 
        message: 'Failed to update profile',
        error: error.message 
      });
    }
  };



  