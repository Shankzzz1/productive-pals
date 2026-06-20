// controllers/focusController.ts
import { Request, Response } from "express";
import FocusSession from "../model/FocusSession";
import Task from "../model/Task";

interface AuthRequest extends Request {
  user?: any;
}

export const saveSession = async (req: AuthRequest, res: Response) => {
  try {
    const { mode, duration, category = "General" } = req.body;

    if (!mode || !duration) {
      return res.status(400).json({ message: "Mode and duration required" });
    }

    // Count completed tasks for this user
    const tasksCompleted = await Task.countDocuments({ user: req.user._id, completed: true });

    const session = await FocusSession.create({
      user: req.user._id,
      mode,
      duration,
      tasksCompleted,
      category,
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: "Error saving session", error: err });
  }
};

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;

    // Fetch all focus sessions
    const sessions = await FocusSession.find({ user: userId })
      .sort({ completedAt: -1 })
      .lean();

    // Fetch completed tasks for the user
    const tasks = await Task.find({ user: userId, completed: true }).lean();

    // Map sessions to frontend format with real tasks completed per session date
    const formattedSessions = sessions.map((s) => {
      const sessionDate = s.completedAt.toISOString().split("T")[0];

      // Count completed tasks on the same date as the session
      const tasksCompleted = tasks.filter(
        (t) => t.createdAt.toISOString().split("T")[0] === sessionDate
      ).length;

      return {
        id: s._id,
        date: sessionDate,
        focusTime: Math.round((s.duration / 60) * 10) / 10, // seconds → hours
        tasksCompleted,
        mode: s.mode,
        category: s.category || "General",
      };
    });

    res.json(formattedSessions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sessions", error: err });
  }
};
