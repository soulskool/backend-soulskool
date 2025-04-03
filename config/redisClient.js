// import { createClient } from "redis";
// import dotenv from "dotenv";

// dotenv.config();

// // Determine the Redis URL based on environment
// const REDIS_URL =
//   process.env.NODE_ENV === "development"
//     ? "redis://localhost:6379" // Local Redis in development
//     : "redis://default:bXF2roDDmtgtsl6rcwf3nMy4qb7wSgPA@redis-10385.c8.us-east-1-4.ec2.redns.redis-cloud.com:10385"; // Cloud Redis in production

// // Create Redis client
// export const client = createClient({
//   url: REDIS_URL,
//   socket: {
//     reconnectStrategy: (retries) => {
//       console.warn(`🔄 Redis reconnect attempt: ${retries}`);
//       if (retries > 10) return new Error("❌ Too many retries, Redis is down.");
//       return Math.min(retries * 1000, 5000); // Exponential backoff (max 5 sec)
//     },
//   },
// });

// // Debugging event listeners
// client.on("error", (err) => console.error("❌ Redis Error:", err));
// client.on("connect", () => console.log("✅ Redis Client Connected"));
// client.on("ready", () => console.log("✅ Redis Client Ready"));
// client.on("reconnecting", () => console.log("🔄 Redis Client Reconnecting..."));
// client.on("end", () => console.log("🛑 Redis Client Connection Ended"));

// // Graceful shutdown handling
// const closeRedis = async () => {
//   try {
//     if (client.isOpen) {
//       await client.quit();
//       console.log("✅ Redis client closed.");
//     }
//     process.exit(0);
//   } catch (err) {
//     console.error("❌ Error closing Redis:", err.message);
//     process.exit(1);
//   }
// };

// // Handle process termination signals
// process.on("SIGINT", closeRedis);
// process.on("SIGTERM", closeRedis);

// // Function to connect Redis when needed
// export const connectRedis = async () => {
//   try {
//     if (!client.isOpen) {
//       await client.connect();
//       console.log("✅ Redis connection established successfully!");
//     }
//   } catch (err) {
//     console.error("❌ Redis connection failed:", err);
//   }
// };









import { createClient } from "redis";
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client
export const client = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
  });;

// Handle Redis errors
client.on("error", (err) => console.error("❌ Redis Error:", err));

// Function to connect to Redis
export const connectRedis = async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
            console.log("✅ Redis connected successfully!");
        }
    } catch (err) {
        console.error("❌ Redis connection failed:", err);
    }
};