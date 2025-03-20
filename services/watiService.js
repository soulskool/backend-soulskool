// services/watiService.js
import axios from 'axios';
import { watiConfig } from '../config/wati.config.js';

/**
 * Send a WhatsApp template message
 * 
 * @param {string} phoneNumber - Receiver's phone number
 * @param {string} templateName - Name of the template in WATI
 * @param {Array} parameters - Template parameters
 * @returns {Promise} - API response
 */
export const sendWhatsAppTemplate = async (phoneNumber, templateName, parameters = []) => {
  try {
    // Format phone number (ensure it has country code but no '+')
    const cleanNumber = phoneNumber.replace(/^\+/, '');
    
    const url = `https://live-mt-server.wati.io/${watiConfig.clientId}/api/v1/sendTemplateMessage?whatsappNumber=${cleanNumber}`;
    
    const payload = {
      parameters,
      broadcast_name: templateName,
      template_name: templateName || watiConfig.templates.verification
    };
    
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${watiConfig.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Template message sent to ${cleanNumber} successfully`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error sending WhatsApp template to ${phoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
};
















/**
 * Process a WhatsApp message webhook
 * 
 * @param {Object} webhookData - The webhook data from WATI
 * @returns {Object} - Processed message data
 */
export const processWebhookMessage = (webhookData) => {
  // Extract the message information
  const { 
    waId,           // WhatsApp ID (usually the phone number)
    text,           // Message text
    senderName,     // Name of the sender
    type            // Message type (text, button, etc.)
  } = webhookData;
  
  // Normalize phone number (remove "+" if present)
  const phoneNumber = waId.replace(/^\+/, '');
  
  // Get the actual message text (handle both text and button messages)
  let messageText = text;
  if (type === 'button' && webhookData.buttonReply) {
    messageText = webhookData.buttonReply.text;
  }
  
  return {
    phoneNumber,
    messageText,
    senderName,
    type,
    originalData: webhookData
  };
};

export default {
  sendWhatsAppTemplate,
  processWebhookMessage
};