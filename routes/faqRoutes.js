import express from 'express';
import {
    createFAQ,
    getFAQs,
    updateFAQ,
    deleteFAQ,
} from '../controllers/faqController.js';
import{
    authenticate,
    authorize
} from '../middleware/auth.js';
import {
    body,
    param,
    validationResult
} from "express-validator";

const router = express.Router();

//  Middleware: Validate FAQ input
const validateFAQ = [
    body("question").notEmpty().withMessage("Question is required"),
    body("answer").notEmpty().withMessage("Answer is required"),
];

//  Middleware: Validate ID Parameter
const validateIdParam = [
    param("id").isMongoId().withMessage("Invalid FAQ ID format"),
];

// Get All FAQs (Public)
router.get("/", getFAQs);

//  Create an FAQ (Admin Only)
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validateFAQ,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createFAQ
);

//  Update an FAQ (Admin Only)
router.put(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateIdParam,
    validateFAQ,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    updateFAQ
);

//  Delete an FAQ (Admin Only)
router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateIdParam,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    deleteFAQ
  );
  
  export default router;
