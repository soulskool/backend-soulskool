import User from "../models/userModel.js"; // Adjust path as needed

/**
 * Get the current rank of a user based on their phone number
 * @param {Object} req - Request object with phoneNumber in params
 * @param {Object} res - Response object
 * @returns {Object} - Returns rank of the user in the response
 */
export const getUserRank = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber || !/^(\+?\d{10,15})$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    const user = await User.findOne({ phoneNumber }).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 🔥 Count users with more points (no need to load all users)
    const rank = await User.countDocuments({ points: { $gt: user.points } });

    return res.status(200).json({
      success: true,
      rank: rank + 1, // +1 because rank starts from 1
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error calculating user rank",
      error: error.message,
    });
  }
};








export const getUserInfo = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber || !/^(\+?\d{10,15})$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    const user = await User.findOne({ phoneNumber }).select("-__v").lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // b Get current rank without loading all users
    const rank = await User.countDocuments({ points: { $gt: user.points } });

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        currentRank: rank + 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving user information",
      error: error.message,
    });
  }
};






export const getReferredUsers = async (req, res) => {
  try {
    const { referralCode } = req.params;

    // Validate referral code
    if (!referralCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Referral code is required" 
      });
    }

    // Find all users referred by this referral code
    const referredUsers = await User.find({ 
      referredBy: referralCode 
    })
    .select('name phoneNumber') // Select only name and phone number
    .sort({ name: 1 }); // Sort by name in ascending order

    // If no referred users found
    if (referredUsers.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No referred users found" 
      });
    }

    // Return the list of referred users
    res.status(200).json({
      success: true,
      count: referredUsers.length,
      data: referredUsers
    });
  } catch (error) {
        res.status(500).json({ 
      success: false, 
      message: "Server error while fetching referred users" 
    });
  }
};


