import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensures no duplicate numbers
      validate: {
        validator: function (v) {
          return /^(\+?\d{10,15})$/.test(v); // More flexible regex
        },
        message: "Invalid Phone Number Format",
      },
    },
    yearOfBirth: {
      type: Number,
      required: true,
      min: 1900, // Prevents unrealistic values
      max: new Date().getFullYear(), // Ensures it's not a future year
    },
    place: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referralLink: {
      type: String,
      unique: true,
      sparse: true, // ✅ Allows `null` values while keeping uniqueness
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    points: {
      type: Number,
      default: 0,
      min: 0, // Prevents negative points
    },
    totalInvites: {
      type: Number,
      default: 0,
      min: 0, // Tracks how many users this person referred
    },
    rank: {
      type: Number,
      default: 1, // Rank can increase based on referrals, points, etc.
      min: 1,
    },
    level: {
      type: String,
      default: "Beginner", // Could be "Beginner", "Intermediate", "Expert", etc.
      enum: ["Beginner", "Intermediate", "Expert", "Master"],
    },
    qrCode: {
      type: String, // Store QR code URL or base64 string
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Auto-generates `createdAt` & `updatedAt`
);

// Indexes for better performance
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ isAdmin: 1 });
UserSchema.index({ referralLink: 1 }, { unique: true, sparse: true });
UserSchema.index({ referredBy: 1 });
UserSchema.index({ rank: 1 });
UserSchema.index({ level: 1 });
UserSchema.index({ gender: 1 });
UserSchema.index({ yearOfBirth: 1 });
UserSchema.index({ qrCode: 1 }); // Add index for qrCode field

// Static Method: Get paginated users
UserSchema.statics.getPaginatedUsers = async function (page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return await this.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
};

// Compile & Export Model
const User = mongoose.model("User", UserSchema);
export default User;