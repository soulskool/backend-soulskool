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

    // Validate phone number
    if (!phoneNumber || !/^(\+?\d{10,15})$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Find the user by phone number
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all users sorted by points in descending order
    const allUsers = await User.find().sort({ points: -1 }).lean();
    
    // Find the position of the user in the sorted array
    const userRank = allUsers.findIndex(u => u._id.toString() === user._id.toString()) + 1;

    return res.status(200).json({
      success: true,
      rank: userRank,
    });
  } catch (error) {
    console.error("Error getting user rank:", error);
    return res.status(500).json({
      success: false,
      message: "Error calculating user rank",
      error: error.message,
    });
  }
};











/**
 * Get the latest information of a user based on their phone number
 * @param {Object} req - Request object with phoneNumber in params
 * @param {Object} res - Response object
 * @returns {Object} - Returns complete user information in the response
 */
export const getUserInfo = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    // Validate phone number
    if (!phoneNumber || !/^(\+?\d{10,15})$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Find the user by phone number and exclude sensitive fields
    const user = await User.findOne({ phoneNumber }).select("-__v").lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get current rank (optional - only if you want to include updated rank)
    const allUsers = await User.find().sort({ points: -1 }).lean();
    const userRank = allUsers.findIndex(u => u._id.toString() === user._id.toString()) + 1;
    
    // Add the calculated rank to user information
    const userInfo = {
      ...user,
      currentRank: userRank // This provides the most up-to-date rank
    };

    return res.status(200).json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    console.error("Error getting user information:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving user information",
      error: error.message,
    });
  }
};