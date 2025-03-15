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
    referralCode:{
       type:String,
       unique:true,
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
UserSchema.index({ referredBy: 1 }); // ✅ Added for better lookup performance

// Static Method: Get paginated users
UserSchema.statics.getPaginatedUsers = async function (page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return await this.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
};

// Compile & Export Model
const User = mongoose.model("User", UserSchema);
export default User;
