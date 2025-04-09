// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// let isConnected = false;
// let retryAttempts = 0; // Track retries

// const connectDB = async () => {
//     if (isConnected) {
//                 return;
//     }

//     try {
//         if (!process.env.MONGO_URI) {
//             throw new Error("❌ MONGO_URI is missing in environment variables.");
//         }

//         const conn = await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             maxPoolSize: 10, // Optimized connection pooling
//         });

//         isConnected = conn.connections[0].readyState === 1;
//                 // 🔹 Remove duplicate `email_1` index if it exists
//         try {
//             await mongoose.connection.db.collection("users").dropIndex("email_1");
//                     } catch (err) {
//             if (err.codeName !== "IndexNotFound") {
//                             }
//         }

//         retryAttempts = 0; // Reset retry counter on success

//     } catch (err) {
//                 retryAttempts += 1;
//         const retryDelay = Math.min(5000 * retryAttempts, 30000); // Exponential backoff (max 30s)

//                 setTimeout(connectDB, retryDelay);
//     }
// };

// // 🔹 Graceful Shutdown
// const closeDB = async () => {
//     try {
//         await mongoose.connection.close();
//                 process.exit(0);
//     } catch (err) {
//                 process.exit(1);
//     }
// };

// // Handle process termination
// process.on("SIGINT", closeDB);
// process.on("SIGTERM", closeDB);

// export default connectDB;











import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is missing in environment variables.");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      serverSelectionTimeoutMS: 5000, // fail fast
      socketTimeoutMS: 10000,         // disconnect slow sockets
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);

    // Retry with exponential backoff
    const retryDelay = Math.min(5000 * 2, 30000); // max 30s
    setTimeout(connectDB, retryDelay);
  }
};

// Graceful Shutdown
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 MongoDB Disconnected");
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
};

process.on("SIGINT", closeDB);
process.on("SIGTERM", closeDB);

export default connectDB;



