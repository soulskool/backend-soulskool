// import jwt from "jsonwebtoken";

// //  Ensure JWT_SECRET is Defined at Startup
// if (!process.env.JWT_SECRET) {
//     throw new Error(" JWT_SECRET is missing in environment variables!");
// }

// //  In-Memory Blacklist for Revoked Tokens (Consider Redis in Production)
// const tokenBlacklist = new Set();

// // 🔹 Middleware: Authenticate User with JWT
// const authenticate = (req, res, next) => {
//     try {
//         const authHeader = req.headers["authorization"] || req.headers["Authorization"]; // Case-insensitive

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ message: " Unauthorized: No Token Provided" });
//         }

//         const token = authHeader.split(" ")[1]; // Extract Token

//         // 🔹 Check if Token is Blacklisted (Logged Out)
//         if (tokenBlacklist.has(token)) {
//             return res.status(401).json({ message: " Token has been revoked. Please login again." });
//         }

//         // 🔹 Verify Token
//         const verified = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = verified; // Attach User to Request

//         next(); // Proceed to Next Middleware
//     } catch (err) {
//         console.error(" Authentication Error:", err.message);

//         return res.status(401).json({
//             message: err.name === "TokenExpiredError" ? " Token Expired" : " Invalid Token",
//             error: err.message,
//         });
//     }
// };

// // 🔹 Middleware: Authorize User Roles
// const authorize = (roles) => {
//     return (req, res, next) => {
//         if (!req.user) {
//             return res.status(403).json({ message: " Unauthorized Access" });
//         }

//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({ message: " Forbidden: Access Denied" });
//         }

//         next();
//     };
// };

// // 🔹 Logout Function: Add Token to Blacklist
// const logout = (req, res) => {
//     try {
//         const authHeader = req.headers["authorization"];
//         if (!authHeader) {
//             return res.status(400).json({ message: " No token provided for logout." });
//         }

//         const token = authHeader.split(" ")[1]; // Extract Token
//         tokenBlacklist.add(token); // Add to Blacklist

//         res.status(200).json({ message: " Successfully logged out" });
//     } catch (error) {
//         res.status(500).json({ message: " Server Error", error: error.message });
//     }
// };

// export { authenticate, authorize, logout };



import jwt from "jsonwebtoken";

// Ensure JWT_SECRET is Defined at Startup
if (!process.env.JWT_SECRET) {
    throw new Error("❌ JWT_SECRET is missing in environment variables!");
}

// In-Memory Blacklist for Revoked Tokens (Use Redis for production)
const tokenBlacklist = new Set();

// 🔹 Middleware: Authenticate User with JWT
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization; // Case-insensitive

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "⛔ Unauthorized: No Token Provided" });
        }

        const token = authHeader.split(" ")[1]; // Extract Token

        // 🔹 Check if Token is Blacklisted (Logged Out)
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ success: false, message: "⛔ Token has been revoked. Please login again." });
        }

        // 🔹 Verify Token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach User to Request

        next(); // Proceed to Next Middleware
    } catch (err) {
        console.error("❌ Authentication Error:", err.message);

        return res.status(401).json({
            success: false,
            message: err.name === "TokenExpiredError" ? "⚠️ Token Expired" : "⛔ Invalid Token",
            error: err.message,
        });
    }
};

// 🔹 Middleware: Authorize User Roles
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ success: false, message: "⛔ Unauthorized Access" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: "🚫 Forbidden: Access Denied" });
        }

        next();
    };
};

// 🔹 Logout Function: Add Token to Blacklist
const logout = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(400).json({ success: false, message: "⚠️ No token provided for logout." });
        }

        const token = authHeader.split(" ")[1]; // Extract Token
        tokenBlacklist.add(token); // Add to Blacklist

        res.status(200).json({ success: true, message: "✅ Successfully logged out" });
    } catch (error) {
        res.status(500).json({ success: false, message: "❌ Server Error", error: error.message });
    }
};

export { authenticate, authorize, logout };
