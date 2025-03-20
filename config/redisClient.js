// import { createClient } from "redis";
// import dotenv from "dotenv";

// dotenv.config();

// // Create Redis client with authentication support
// const redisClient = createClient({
//     url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
//     password: process.env.REDIS_PASSWORD || undefined, // For secured Redis  // Authentication support
//     socket: {
//         reconnectStrategy: (retries) => {
//             console.warn(` Redis reconnect attempt: ${retries}`);
//             if (retries > 10) return new Error(" Too many retries, Redis is down.");
//             return Math.min(retries * 1000, 5000); // Exponential backoff  (max 5sec)
//         }
//     }
// });

// // Event Listeners for Better Debugging
// redisClient.on('connect', () => console.log(' Redis connected successfully!'));
// redisClient.on('error', (err) => console.error(' Redis connection error:', err.message));
// redisClient.on('reconnecting', () => console.log(' Attempting to reconnect to Redis...'));
// redisClient.on("ready",()=> console.log("Redis is ready to use! "));

// // Graceful Shutdown Handling
// const closeRedis = async () => {
//     try {
//         if (redisClient.isOpen) {
//             await redisClient.quit();
//             console.log("Redis client closed.");
//         }
//         process.exit(0);
//     } catch (err) {
//         console.error("Error closing Redis:", err.message);
//         process.exit(1);
//     }
// };

// // Handle process termination
// process.on("SIGINT", closeRedis);
// process.on("SIGTERM", closeRedis);

// // Lazy Connection Function (Only connect when needed)
// const connectRedis = async () => {
//     if (!redisClient.isOpen) {
//         try {
//             await redisClient.connect();
//             console.log(" Redis connection established!");
//         } catch (err) {
//             console.error(" Redis failed to connect:", err.message);
//             setTimeout(connectRedis, 5000); // Retry after 5s
//         }
//     }
// };


// export {redisClient,connectRedis};










import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Create Redis client configured for Docker Redis Stack
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    
    socket: {
        reconnectStrategy: (retries) => {
            console.warn(` Redis reconnect attempt: ${retries}`);
            if (retries > 10) return new Error(" Too many retries, Redis is down.");
            return Math.min(retries * 1000, 5000); // Exponential backoff (max 5sec)
        }
    }
});

// Event Listeners for Better Debugging
// Add more detailed event listeners
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));
redisClient.on("connect", () => console.log("✅ Redis Client Connected"));
redisClient.on("ready", () => console.log("✅ Redis Client Ready"));
redisClient.on("reconnecting", () => console.log("🔄 Redis Client Reconnecting..."));
redisClient.on("end", () => console.log("🛑 Redis Client Connection Ended"));
// Graceful Shutdown Handling
const closeRedis = async () => {
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log("Redis client closed.");
        }
        process.exit(0);
    } catch (err) {
        console.error("Error closing Redis:", err.message);
        process.exit(1);
    }
};

// Handle process termination
process.on("SIGINT", closeRedis);
process.on("SIGTERM", closeRedis);

// Lazy Connection Function (Only connect when needed)
export const connectRedis = async () => {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("✅ Redis connection established successfully!");
      }
    } catch (err) {
      console.error("❌ Redis connection failed:", err);
    }
  };
export { redisClient };