// models/verificationModel.js
import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  referredBy: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically delete after 24 hours if not verified
  }
});

export default mongoose.model('Verification', verificationSchema);