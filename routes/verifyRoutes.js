// import express from 'express';
// import {verify} from '../controllers/verifyController';

// const router = express.Router();

// // Route for WhatsApp verification
// router.post('/verify', verify);

// export default router;


import express from "express";
import { verify } from "../controllers/verifyController.js";

const router = express.Router();

//  Route for WhatsApp Verification
router.post("/verify", verify);

export default router;
