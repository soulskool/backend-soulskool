// import express from 'express';
// import {generateReferralLink} from '../controllers/referralController';
// import {authenticate} from '../middleware/auth';

// const router = express.Router();

// router.get('/generate', authenticate, generateReferralLink);

// export default router;


import express from "express";
import { generateReferralLink } from "../controllers/referralController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

//  Route: Generate Referral Link (Authenticated Users Only)
router.get("/generate", authenticate, generateReferralLink);

export default router;
