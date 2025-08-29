// models/FocusSession.ts
import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mode: { type: String, enum: ["pomodoro", "shortBreak", "longBreak"], required: true },
    duration: { type: Number, required: true }, // in seconds
    tasksCompleted: { type: Number, default: 0 },
    category: { type: String, default: "General" },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const FocusSession = mongoose.model("FocusSession", focusSessionSchema);
export default FocusSession;
