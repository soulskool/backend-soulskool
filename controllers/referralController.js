
// import userModel from "../models/userModel";
// /**
//  @desc Generate a Referral Link for the User
//  * @route GET /api/referral-link
//  * @access Private (Authenticated Users Only)
//  */

// export const generateReferralLink = async(req,res)=>{

//    try {
    
//      // Ensure user is authenticated
//      if(!req.user?.userId){
//         return res.status(401).json({
//             message: "Unauthorized: User ID is missing."
//         });
//     }

//     const user = await userModel.findById(req.user.userId,"name referralCode").lean();

//     //check if User exists
//     if(!user){
//         return res.status(404).json({
//             message: "User not found"
//         })
//     }

//     //Ensure user has a referral code
//     if (!user.referralCode) {
//         return res.status(400).json({ 
//             message: "User does not have a referral code."
//         });
//     }

//     //Generate sanitized referral link 
//     const cleanName = user.name?user.name.trim().replace(/\s+/g,"-").toLowerCase():"user";
//     const referralLink = `https://AnyCanDance.com/free-trial/y/${cleanName}_${user.referralCode}`;

//     res.status(200).json({ referralLink });
//    } catch (error) {
//     console.error("Error generating referral link:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//    }
// }


import userModel from "../models/userModel.js";

/**
 * @desc Generate a Referral Link for the User
 * @route GET /api/referral-link
 * @access Private (Authenticated Users Only)
 */
export const generateReferralLink = async (req, res) => {
    try {
        // Ensure user is authenticated
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID is missing.",
            });
        }

        // Fetch user data with only necessary fields
        const user = await userModel.findById(req.user.userId, "name referralCode").lean();

        // Check if User exists
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Ensure user has a referral code
        if (!user.referralCode) {
            return res.status(400).json({
                success: false,
                message: "User does not have a referral code.",
            });
        }

        // Generate sanitized referral link
        const cleanName = user.name
            ? user.name.trim().replace(/\s+/g, "-").toLowerCase()
            : "user";

        const referralLink = `${process.env.BASE_URL}/free-trial/y/${cleanName}_${user.referralCode}`;

        res.status(200).json({
            success: true,
            referralLink,
        });

    } catch (error) {
        console.error("❌ Error generating referral link:", error);
        res.status(500).json({
            success: false,
            message: "Server Error. Please try again later.",
            error: error.message,
        });
    }
};
