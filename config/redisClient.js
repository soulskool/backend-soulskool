import { createClient } from "redis";

// Create Redis client
const client = createClient({
    username: "default",
    password: "bXF2roDDmtgtsl6rcwf3nMy4qb7wSgPA",
    socket: {
        host: "redis-10385.c8.us-east-1-4.ec2.redns.redis-cloud.com",
        port: 10385,
    },
});

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


export { client };
