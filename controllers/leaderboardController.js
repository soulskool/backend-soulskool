import User from "../models/userModel.js";
import { client, connectRedis } from "../config/redisClient.js";

/**
 * @desc Get Leaderboard with Pagination & Search
 * @route GET /api/leaderboard
 * @access Public
//  */




export const getLeaderboard = async (req, res) => {
    try {
        await connectRedis();

        let { page = 1, limit = 10, search = "" } = req.query;
        page = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.max(parseInt(limit, 10) || 10, 1);

        const cacheKey = `leaderboard_page_${page}_limit_${limit}_search_${search}`;

        // Check Redis cache
        const cachedLeaderboard = await client.get(cacheKey);
        if (cachedLeaderboard) {
            return res.status(200).json(JSON.parse(cachedLeaderboard));
        }

        // Apply search filter
        const filter = search ? { name: { $regex: search, $options: "i" } } : {};

        // Get total users count (filtered)
        const totalUsers = await User.countDocuments(filter);

        // Fetch users (only required fields)
        const users = await User.find(filter, "name phoneNumber points") // Select only required fields
            .sort({ points: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Add rank to each user
        users.forEach((user, index) => {
            user.rank = (page - 1) * limit + index + 1;
        });

        const response = {
            success: true,
            page,
            limit,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            users, // Only `name`, `phoneNumber`, `rank`, and `points`
        };

        // Cache leaderboard for 30 seconds
        await client.setEx(cacheKey, 30, JSON.stringify(response));

        return res.status(200).json(response);
    } catch (error) {
                return res.status(500).json({ success: false, message: "Server error." });
    }
};
















/**
 * @desc Update User Score
 * @route POST /api/leaderboard/update
 * @access Public
 */
export const updateUserScore = async (req, res) => {
    try {
        await connectRedis();
        const { username, points } = req.body;

        if (!username || typeof points !== "number") {
            return res.status(400).json({ success: false, message: "Username and valid points required." });
        }

        // Update or create user
        const updatedUser = await User.findOneAndUpdate(
            { name: username },
            { $set: { points } },
            { new: true, upsert: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Invalidate leaderboard cache
        await client.flushDb();
                return res.status(200).json({
            success: true,
            message: `Updated ${username}'s score`,
            username,
            points: updatedUser.points,
        });

    } catch (error) {
                return res.status(500).json({ success: false, message: "Server error." });
    }
};

/**
 * @desc Get User Rank
 * @route GET /api/leaderboard/rank/:username
 * @access Public
 */
export const getUserRank = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required." });
        }

        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Get rank
        const higherRankedUsers = await User.countDocuments({ points: { $gt: user.points } });
        const rank = higherRankedUsers + 1;

        return res.status(200).json({
            success: true,
            username,
            points: user.points,
            rank,
        });

    } catch (error) {
                return res.status(500).json({ success: false, message: "Server error." });
    }
};