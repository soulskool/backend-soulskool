import { createClient } from "redis";

const redisClient = createClient();

redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

(async () => {
    try {
        if (!redisClient.isOpen) await redisClient.connect();
        console.log("✅ Redis connected successfully!");
    } catch (err) {
        console.error("❌ Redis connection failed:", err);
    }
})();

/**
 * @desc Get Leaderboard with Pagination & Search
 * @route GET /api/leaderboard
 * @access Public
 */
export const getLeaderboard = async (req, res) => {
    try {
        let { page = 1, limit = 100, search = "" } = req.query;

        // Convert query params to integers & set defaults
        page = Math.max(parseInt(page, 10) || 1, 1);
        limit = Math.max(parseInt(limit, 10) || 100, 1);

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                message: "Page and limit must be positive integers.",
            });
        }

        const start = (page - 1) * limit;
        const end = start + limit - 1;

        // Get total user count in leaderboard
        const totalUsers = await redisClient.zCard("leaderboard");

        if (totalUsers === 0) {
            return res.status(200).json({
                success: true,
                message: "No users in the leaderboard.",
                totalUsers,
                totalPages: 0,
                users: [],
            });
        }

        if (start >= totalUsers) {
            return res.status(404).json({
                success: false,
                message: "No users found on this page.",
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
            });
        }

        // Fetch leaderboard users with scores
        let users = await redisClient.zRangeWithScores("leaderboard", start, end, { REV: true });

        // Apply search filter if provided
        if (search.trim()) {
            const searchTerm = search.toLowerCase();
            users = users.filter((user) => user.member.toLowerCase().includes(searchTerm));
        }

        res.status(200).json({
            success: true,
            page,
            limit,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            users,
        });

    } catch (error) {
        console.error("❌ Error fetching leaderboard:", error);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
            error: error.message,
        });
    }
};
