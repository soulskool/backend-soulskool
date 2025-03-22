// controllers/referralController.js
import userModel from "../models/userModel.js";

export const createReferralLink = async (userId) => {
    try {
        // Fetch user data with only necessary fields
        const user = await userModel.findById(userId, "name referralCode").lean();

        if (!user || !user.referralCode) {
            throw new Error("User not found or missing referral code.");
        }

        // Generate sanitized referral link
        const cleanName = user.name
            ? user.name.trim().replace(/\s+/g, "-").toLowerCase()
            : "user";

        return `${process.env.BASE_URL}/free-trial/y/${cleanName}_${user.referralCode}`;
    } catch (error) {
        console.error("❌ Error creating referral link:", error);
        throw error;
    }
};

// Existing API route handler remains unchanged
export const generateReferralLink = async (req, res) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: User ID is missing." });
        }

        const referralLink = await createReferralLink(req.user.userId);
        res.status(200).json({ success: true, referralLink });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error.", error: error.message });
    }
};
