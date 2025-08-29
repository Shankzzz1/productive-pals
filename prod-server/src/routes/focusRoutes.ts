// routes/focusRoutes.ts
import express from "express";
import { saveSession, getSessions } from "../controller/focusController";
import { protect } from "../middleware/authmiddleware";

const router = express.Router();

router.post("/", protect, saveSession);  // Save a completed session
router.get("/", protect, getSessions);  // Get all sessions of a user

export default router;
