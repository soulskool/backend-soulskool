import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js"
import {  connectRedis } from './config/redisClient.js';

// After MongoDB connection





// Import Routes
 import leaderboardRoutes from "./routes/leaderboardRoutes.js";

// import verifyRoutes from "./routes/verifyRoutes.js";
import userRoutes from "./routes/userRoutes.js";



// Add this where you define your routes


// Load environment variables
dotenv.config();

// Connect to Database
connectDB();
await connectRedis();


// Initialize Express App
const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request Logging (Only in Development Mode)
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Rate Limiting (Prevents DDoS Attacks)
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per windowMs
//     message: "Too many requests, please try again later.",
// });
// app.use(limiter);



// API Routes
app.use("/api/users", userRoutes);
// app.use("/api/questions", questionRoutes);
// app.use("/api/resources", resourceRoutes);
// app.use("/api/referral", referralRoutes);
// app.use("/api/verify", verifyRoutes);
 app.use("/api/leaderboard", leaderboardRoutes);





// 404 Handler (Should be placed **after** all routes)
app.use((req, res) => {
    res.status(404).json({ message: "Route Not Found" });
});

// Error Handling Middleware (Must be the last middleware)
app.use((err, req, res, next) => {
        res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    }).on("error", (err) => {
        process.exit(1);
});
