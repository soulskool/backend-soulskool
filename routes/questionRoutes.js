// import express from 'express';
// import{
//     addQuestion,
//     getAllQuestions,
//     sendNextQuestion
// } from "../controllers/quizController.js"
// import {
//     authenticate,
//     authorize
// } from "../middleware/auth.js"

// const router = express.Router();
// router.post("/add", authenticate, authorize(["admin"]), addQuestion);

// //Route to Get All Questions (Admin Only)
// router.get("/", authenticate, authorize(["admin"]), getAllQuestions);

// //Route to Send Next Question via WhatsApp
// router.post("/send-next", authenticate, sendNextQuestion);

// export default router;


import express from "express";
import {
  addQuestion,
  getAllQuestions,
  sendNextQuestion,
} from "../controllers/quizController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

//  Middleware: Validate quiz question input
const validateQuestionInput = [
  body("text").notEmpty().withMessage("Question text is required"),
  body("options")
    .isArray({ min: 2 })
    .withMessage("At least two options are required"),
  body("sequenceNumber")
    .isInt({ min: 1 })
    .withMessage("Sequence number must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

//  Middleware: Validate WhatsApp question request
const validateSendNextQuestion = [
  body("phone")
    .isMobilePhone()
    .withMessage("Valid phone number is required"),
  body("currentSequence")
    .isInt({ min: 0 })
    .withMessage("Current sequence number must be a non-negative integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

//  Route: Add a quiz question (Admin Only)
router.post("/add", authenticate, authorize(["admin"]), validateQuestionInput, addQuestion);

//  Route: Get all quiz questions (Admin Only)
router.get("/", authenticate, authorize(["admin"]), getAllQuestions);

//  Route: Send the next quiz question via WhatsApp
router.post("/send-next", authenticate, validateSendNextQuestion, sendNextQuestion);

export default router;
