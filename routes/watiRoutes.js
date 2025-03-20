// routes/watiRoutes.js
import express from 'express';
import { sendWhatsAppVerification, handleWhatsAppWebhook } from '../controllers/watiController.js';

const router = express.Router();

// Existing route for sending verification
router.post('/send-verification', sendWhatsAppVerification);

// New webhook endpoint to receive messages
router.post('/webhook', handleWhatsAppWebhook);

export default router;