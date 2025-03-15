import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js"


// Import Routes
// import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
// import verifyRoutes from "./routes/verifyRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// import resourceRoutes from "./routes/resourceRoutes.js";
import faqRoutes from "./routes/faqRoutes.js";
// import questionRoutes from "./routes/questionRoutes.js";

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

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
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
});
app.use(limiter);



// API Routes
app.use("/api/users", userRoutes);
// app.use("/api/questions", questionRoutes);
// app.use("/api/resources", resourceRoutes);
app.use("/api/referral", referralRoutes);
// app.use("/api/verify", verifyRoutes);
// app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/faq", faqRoutes);

// 404 Handler (Should be placed **after** all routes)
app.use((req, res) => {
    res.status(404).json({ message: "Route Not Found" });
});

// Error Handling Middleware (Must be the last middleware)
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    res.status(err.status || 500).json({ message: err.message || "Server Error" });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || "production"} mode`);
}).on("error", (err) => {
    console.error("Server failed to start:", err);
    process.exit(1);
});
