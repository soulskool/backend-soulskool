import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;
let retryAttempts = 0; // Track retries

const connectDB = async () => {
    if (isConnected) {
        console.log("✅ Already connected to MongoDB");
        return;
    }

    try {
        if (!process.env.MONGO_URI) {
            throw new Error("❌ MONGO_URI is missing in environment variables.");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Optimized connection pooling
        });

        isConnected = conn.connections[0].readyState === 1;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // 🔹 Remove duplicate `email_1` index if it exists
        try {
            await mongoose.connection.db.collection("users").dropIndex("email_1");
            console.log("✅ Removed duplicate index on email_1");
        } catch (err) {
            if (err.codeName !== "IndexNotFound") {
                console.log("ℹ️ No email index found or already removed.");
            }
        }

        retryAttempts = 0; // Reset retry counter on success

    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);

        retryAttempts += 1;
        const retryDelay = Math.min(5000 * retryAttempts, 30000); // Exponential backoff (max 30s)

        console.log(`🔄 Retrying in ${retryDelay / 1000} seconds...`);
        setTimeout(connectDB, retryDelay);
    }
};

// 🔹 Graceful Shutdown
const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log("🛑 MongoDB Connection Closed");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error closing MongoDB connection:", err.message);
        process.exit(1);
    }
};

// Handle process termination
process.on("SIGINT", closeDB);
process.on("SIGTERM", closeDB);

export default connectDB;
