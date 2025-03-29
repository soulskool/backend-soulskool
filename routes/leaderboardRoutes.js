





import express from "express";
import { getLeaderboard, updateUserScore, getUserRank } from "../controllers/leaderboardController.js";

const router = express.Router();

router.get("/", getLeaderboard);
router.post("/update", updateUserScore);
router.get("/rank/:username", getUserRank);

export default router;