// const User = require('../models/userModel');
// const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// export const verify = async(req,res)=>{
//     try{
//         const{phone} = req.body;
        
//         const user = await User.findOne({
//             PhoneNumber:phone
//         });

//         // Send WhatsApp message
//         await client.messages.create({
//             from:`whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
//             to:`whatsapp:${phone}`,
//             body:`Please type 'VERIFY' to verify your phone number`
//         });

//         res.status(200).json({
//             message:"Verification code sent successfully"
//         });

//     } catch(err){
//         console.error(err);
//         res.status(500).json({
//             message:"Server Error"
//         });
//     }
// };


import User from "../models/userModel";
import client from "../config/twilio";

export const verify = async (req, res) => {
    try {
        const { phone } = req.body;

        //  Validate Input: Ensure phone number is provided
        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        //  Validate Phone Format (E.164 Standard)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: "Invalid phone number format. Use E.164 format." });
        }

        //  Check if User Exists in Database
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //  Send WhatsApp Verification Message
        try {
            await client.messages.create({
                from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
                to: `whatsapp:${phone}`,
                body: "Please type 'VERIFY' to verify your phone number."
            });

            return res.status(200).json({ message: "Verification message sent successfully" });
        } catch (twilioError) {
            console.error("Twilio API Error:", twilioError);
            return res.status(500).json({ message: "Failed to send verification message", error: twilioError.message });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



