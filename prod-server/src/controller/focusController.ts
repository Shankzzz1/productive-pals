// controllers/focusController.ts
import { Request, Response } from "express";
import FocusSession from "../model/FocusSession";

interface AuthRequest extends Request {
  user?: any;
}

export const saveSession = async (req: AuthRequest, res: Response) => {
  try {
    const { mode, duration } = req.body;

    if (!mode || !duration) {
      return res.status(400).json({ message: "Mode and duration required" });
    }

    const session = await FocusSession.create({
      user: req.user._id,
      mode,
      duration,
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: "Error saving session", error: err });
  }
};

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await FocusSession.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sessions", error: err });
  }
};
