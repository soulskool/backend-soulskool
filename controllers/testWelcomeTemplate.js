// testWelcomeTemplate.js - Dedicated function to test the welcome template

import express from 'express';
import { sendWhatsAppTemplate } from '../services/watiService.js';

const router = express.Router();

/**
 * Test endpoint for welcome message template
 * POST /api/test/welcome-template
 */
export const testWelcomeTemplate= async (req, res) => {
  try {
    const { phoneNumber, name } = req.body;
    
    if (!phoneNumber || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "Phone number and name are required" 
      });
    }

    // Sample referral link for testing
    const referralLink = `https://yourdomain.com/ref/TEST1234`;
    
    // Format phone number (ensure it has country code but remove '+' if present)
    const formattedNumber = phoneNumber.startsWith('+') 
      ? phoneNumber.substring(1) 
      : phoneNumber;
    
    console.log('🔍 Testing welcome template with parameters:');
    console.log(`- Phone: ${formattedNumber}`);
    console.log(`- Name: ${name}`);
    console.log(`- Link: ${referralLink}`);
    
    // Debugging: Log the exact payload being sent
    const payload = [
      { name: '1', value: name },
      { name: '2', value: referralLink }
    ];
    console.log('📝 Template payload:', JSON.stringify(payload, null, 2));
    
    // Try with numeric parameters
    const response = await sendWhatsAppTemplate(
      formattedNumber, 
      'welcome_message__registeration',
      payload
    );
    
    console.log('✅ Template API response:', response);
    
    res.status(200).json({ 
      success: true, 
      message: "Welcome template test sent",
      response: response
    });
    
  } catch (error) {
    console.error("❌ Welcome template test error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send test template", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export default testWelcomeTemplate;

// ---------------------------------------------------------
// Integration with main app.js or index.js
// ---------------------------------------------------------

// Add this to your main app.js or index.js file:
/*
import testRoutes from './routes/testWelcomeTemplate.js';

// Other app configurations...

// Register the test routes
app.use('/api/test', testRoutes);
*/