import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // OTP expires in 5 minutes
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", OtpSchema);
export default Otp;
