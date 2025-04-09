// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const UserSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     phoneNumber: {
//       type: String,
//       required: true,
//       trim: true,
//       unique: true,
//       validate: {
//         validator: function (v) {
//           return /^(\+?\d{10,15})$/.test(v);
//         },
//         message: "Invalid Phone Number Format",
//       },
//     },
//     yearOfBirth: {
//       type: Number,
//       default: null,
//     },
//     place: {
//       type: String,
//       default: null,
//     },
//     gender: {
//       type: String,
//       enum: ["Male", "Female", "Other"],
//       default: "Other",
//     },
//     referralCode: {
//       type: String,
//       unique: true,
//     },
//     referralLink: {
//       type: String,
//       unique: true,
//       sparse: true,
//     },
//     referredBy: {
//       type: String, // Referral code of the referrer
//       default: null,
//     },
//     points: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     totalInvites: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },
//     level: {
//       type: Number,
//       default: -1,
//     },
//     qrCode: {
//       type: String,
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// // Indexes for better performance
// UserSchema.index({ phoneNumber: 1 });
// UserSchema.index({ referralLink: 1 }, { unique: true, sparse: true });
// UserSchema.index({ referredBy: 1 });
// UserSchema.index({ level: 1 });
// UserSchema.index({ gender: 1 });
// UserSchema.index({ yearOfBirth: 1 });
// UserSchema.index({ qrCode: 1 });
// UserSchema.index({ points: -1 }); // For faster rank calculations

// // Static Method: Get paginated users
// UserSchema.statics.getPaginatedUsers = async function (page = 1, limit = 10) {
//   const skip = (page - 1) * limit;
//   return await this.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
// };

// // Compile & Export Model
// const User = mongoose.model("User", UserSchema);
// export default User;







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
      unique: true,
      validate: {
        validator: v => /^(\+?\d{10,15})$/.test(v),
        message: "Invalid Phone Number Format",
      },
    },
    yearOfBirth: Number,
    place: String,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referralLink: String, // remove unique here, keep it only in index()
    referredBy: String,
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalInvites: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: -1,
    },
    qrCode: String,
  },
  { timestamps: true }
);

// 🔹 Indexes (no duplication)
UserSchema.index({ phoneNumber: 1 }, { unique: true });
UserSchema.index({ referralLink: 1 }, { unique: true, sparse: true });
UserSchema.index({ referredBy: 1 });
UserSchema.index({ level: 1 });
UserSchema.index({ gender: 1 });
UserSchema.index({ yearOfBirth: 1 });
UserSchema.index({ qrCode: 1 });
UserSchema.index({ points: -1 }); // for leaderboard

// Pagination helper
UserSchema.statics.getPaginatedUsers = async function (page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return await this.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
};

const User = mongoose.model("User", UserSchema);
export default User;
