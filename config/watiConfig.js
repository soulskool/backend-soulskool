import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ✅ Wati API Credentials from Environment Variables
const WATI_BASE_URL = process.env.WATI_BASE_URL;  // e.g., https://api.wati.io
const WATI_API_KEY = process.env.WATI_API_KEY;    // Your API Key

if (!WATI_BASE_URL || !WATI_API_KEY) {
    console.error("❌ Missing Wati API configurations. Check your .env file!");
    process.exit(1); // Stop execution if env variables are missing
}

// 🚀 Function to Send a WhatsApp Message
export const sendWhatsAppMessage = async (phoneNumber, message) => {
    try {
        const response = await axios.post(
            `${WATI_BASE_URL}/api/v1/sendSessionMessage`,
            {
                number: phoneNumber,
                message: message,
            },
            {
                headers: { Authorization: `Bearer ${WATI_API_KEY}` },
            }
        );

        console.log(`✅ Message sent to ${phoneNumber}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error sending message to ${phoneNumber}:`, error.response?.data || error.message);
        throw error;
    }
};

// 🚀 Function to Send Template Message (Predefined in Wati Dashboard)
export const sendTemplateMessage = async (phoneNumber, templateName, templateParams = []) => {
    try {
        const response = await axios.post(
            `${WATI_BASE_URL}/api/v1/sendTemplateMessage`,
            {
                number: phoneNumber,
                template_name: templateName,
                broadcast_name: "MarketingCampaign", // Optional: For tracking purposes
                parameters: templateParams,
            },
            {
                headers: { Authorization: `Bearer ${WATI_API_KEY}` },
            }
        );

        console.log(`✅ Template '${templateName}' sent to ${phoneNumber}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`❌ Error sending template '${templateName}' to ${phoneNumber}:`, error.response?.data || error.message);
        throw error;
    }
};

// 🚀 Function to Handle Webhook Incoming Messages
export const handleWatiWebhook = async (req, res) => {
    try {
        const { waId, text, type } = req.body; // Extract message data

        console.log(`📩 Incoming WhatsApp Message from ${waId}: ${text}`);

        if (text.toLowerCase() === "verify") {
            await sendWhatsAppMessage(waId, "✅ Your verification is successful! Let's proceed.");
        } else {
            await sendWhatsAppMessage(waId, "🤖 This is an automated response. Type 'verify' to continue.");
        }

        res.status(200).send({ success: true });
    } catch (error) {
        console.error("❌ Error handling Wati Webhook:", error.message);
        res.status(500).send({ success: false, error: error.message });
    }
};
