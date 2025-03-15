import express from "express";
import { getLeaderboard } from "../controllers/leaderboardController.js";
import {
    query,
    validationResult
    } from "express-validator";

const router = express.Router();

//  Middleware: Validate query parameters
const validateLeaderboardParams = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

//  GET Leaderboard Route
router.get(
  "/leaderboard",
  validateLeaderboardParams,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  getLeaderboard
);

export default router;
