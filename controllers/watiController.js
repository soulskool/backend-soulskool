// // controllers/watiController.js
import axios from "axios";
 import { watiConfig } from "../config/wati.config.js";

// export const sendWhatsAppVerification = async (req, res) => {
//   try {
//     const { name, phoneNumber } = req.body;
    
//     if (!phoneNumber || !name) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Phone number and name are required" 
//       });
//     }

//     // Make sure phone number is in international format (without '+')
//     const cleanNumber = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
    
//     console.log(`Attempting to send message to ${cleanNumber}`);
    
//     const requestData = {
//       template_name: watiConfig.templates.verification,
//       broadcast_name: watiConfig.templates.verification,
//       parameters: [
//         {
//           name: "name",
//           value: name
//         }
//       ]
//     };
    
//     // The correct URL format based on your API documentation
//     const url = `https://live-mt-server.wati.io/300647/api/v1/sendTemplateMessage?whatsappNumber=${cleanNumber}`;
    
//     console.log("Request URL:", url);
//     console.log("Request body:", JSON.stringify(requestData));
    
//     const response = await axios.post(
//       url,
//       requestData,
//       {
//         headers: {
//           'Authorization': `Bearer ${watiConfig.token}`,
//           'Content-Type': 'application/json-patch+json',
//           'x-client-id': watiConfig.clientId
//         }
//       }
//     );

//     console.log("WhatsApp message sent successfully:", response.data);
    
//     return res.status(200).json({ 
//       success: true, 
//       message: "Verification message sent successfully", 
//       data: response.data 
//     });
//   } catch (error) {
//     console.error("Error sending WhatsApp message:", error.message);
//     if (error.response) {
//       console.error("Response status:", error.response.status);
//       console.error("Response data:", JSON.stringify(error.response.data));
//       console.error("Response headers:", JSON.stringify(error.response.headers));
//     }
//     return res.status(500).json({ 
//       success: false, 
//       message: "Failed to send verification message", 
//       error: error.response?.data || error.message 
//     });
//   }
// };






// // controllers/watiController.js 

// export const handleWhatsAppWebhook = async (req, res) => {
//     try {
//       console.log("Received webhook from WATI:", JSON.stringify(req.body, null, 2));
      
//       // Extract the message information
//       const { 
//         waId,           // WhatsApp ID (usually the phone number)
//         text,           // Message text
//         senderName,     // Name of the sender
//         timestamp       // When the message was sent
//       } = req.body;
      
//       // Check if the message is a verification message
//       if (text && text.toLowerCase() === "verify number") {
//         console.log(`✅ Verification message received from ${waId} (${senderName})`);
        
//         // For testing, just log the verification - you'll implement the actual verification logic later
//         console.log(`User with number ${waId} should be verified in the database`);
        
//         // Here you would add your logic to:
//         // 1. Find the user by phone number in your database
//         // 2. Update isVerified to true
//         // 3. Handle any referral bonus if applicable
//       } else {
//         console.log(`📩 Received message from ${waId}: "${text}"`);
//       }
      
//       // Always return a 200 status quickly to acknowledge receipt
//       return res.status(200).json({ success: true });
//     } catch (error) {
//       console.error("Error processing webhook:", error);
//       // Still return 200 to prevent WATI from retrying
//       return res.status(200).json({ success: false, error: error.message });
//     }
//   };








// controllers/watiController.js
import verificationModel from '../models/verificationModel.js';
import userModel from '../models/userModel.js';

// Generate a random alphanumeric code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const sendWhatsAppVerification = async (req, res) => {
    try {
      const { name, phoneNumber } = req.body;
      
      if (!phoneNumber || !name) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number and name are required" 
        });
      }
  
      // Make sure phone number is in international format (without '+')
      const cleanNumber = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
      
      console.log(`Attempting to send message to ${cleanNumber}`);
      
      const requestData = {
        template_name: watiConfig.templates.verification,
        broadcast_name: watiConfig.templates.verification,
        parameters: [
          {
            name: "name",
            value: name
          }
        ]
      };
      
      // The correct URL format based on your API documentation
      const url = `https://live-mt-server.wati.io/300647/api/v1/sendTemplateMessage?whatsappNumber=${cleanNumber}`;
      
      console.log("Request URL:", url);
      console.log("Request body:", JSON.stringify(requestData));
      
      const response = await axios.post(
        url,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${watiConfig.token}`,
            'Content-Type': 'application/json-patch+json',
            'x-client-id': watiConfig.clientId
          }
        }
      );
  
      console.log("WhatsApp message sent successfully:", response.data);
      
      return res.status(200).json({ 
        success: true, 
        message: "Verification message sent successfully", 
        data: response.data 
      });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", JSON.stringify(error.response.data));
        console.error("Response headers:", JSON.stringify(error.response.headers));
      }
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send verification message", 
        error: error.response?.data || error.message 
      });
    }
  };










export const handleWhatsAppWebhook = async (req, res) => {
  try {
    console.log("Received webhook from WATI:", JSON.stringify(req.body, null, 2));

    
    
    // Extract the message information
    const { 
      waId,           // WhatsApp ID (usually the phone number)
      text,           // Message text
      senderName,     // Name of the sender
      type            // Message type (text, button, etc.)
    } = req.body;
    
    // Normalize phone number (remove "+" if present)
    let phoneNumber = waId.replace(/^\+/, '');
    
    // Get the actual message text (handle both text and button messages)
    let messageText = text;
    if (type === 'button' && req.body.buttonReply) {
      messageText = req.body.buttonReply.text;
    }
    
    // Check if the message is a verification message
    if (messageText && messageText.toLowerCase() === "verify number") {
      console.log(`✅ Verification message received from ${phoneNumber} (${senderName})`);
      
    //  Find pending verification
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+${phoneNumber}`;
    }
    
      console.log(`✅ Verification message received from ${phoneNumber} (${senderName})`);
      const verification = await verificationModel.findOne({ phoneNumber });
      
      if (!verification) {
        console.log(`⚠️ No pending verification found for ${phoneNumber}`);
        return res.status(200).json({ success: true });
      }
      
      // Mark as verified
      verification.isVerified = true;
      await verification.save();
      
      // Create user in main collection
      const referralCode = generateReferralCode();
      const referralLink = `https://learn.anyonecandance.in/acd/free-trial/y/${verification.name.replace(/\s/g, "").toLowerCase()}_${referralCode}`;
      
      const newUser = await userModel.create({
        name: verification.name,
        phoneNumber,
        referralCode,
        referralLink,
        points: 0
      });
      
      console.log(`refered code by login user ${verification.referredBy}`)
      // Process referral if available
      if (verification.referredBy) {
        const referrer = await userModel.findOne({ referralCode: verification.referredBy });
        
        if (referrer) {
          // Update referrer points
          referrer.points += 50;
          await referrer.save();
          
          // Set referredBy in the new user
          newUser.referredBy = referrer._id;
          await newUser.save();
          
          console.log(`✅ Added 50 points to referrer ${referrer.phoneNumber}`);
        }
      }
      
      console.log(`✅ User account created for ${phoneNumber}`);
    } else {
      console.log(`📩 Received message from ${phoneNumber}: "${messageText}"`);
    }
    
    // Always return a 200 status quickly to acknowledge receipt
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Still return 200 to prevent WATI from retrying
    return res.status(200).json({ success: false, error: error.message });
  }
};