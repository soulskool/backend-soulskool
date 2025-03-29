


import dotenv from "dotenv";

dotenv.config(); // Load environment variables

export const watiConfig = {
    baseUrl: process.env.WATI_BASE_URL,
    clientId: process.env.WATI_CLIENT_ID,
    token: process.env.WATI_TOKEN,
    templates: {
        verification: process.env.WATI_VERIFICATION_TEMPLATE,
        profile_update__otp: process.env.WATI_PROFILE_UPDATE_TEMPLATE
    }
};
