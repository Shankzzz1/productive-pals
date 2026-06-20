"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/FocusSession.ts
const mongoose_1 = __importDefault(require("mongoose"));
const focusSessionSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    mode: { type: String, enum: ["pomodoro", "shortBreak", "longBreak"], required: true },
    duration: { type: Number, required: true }, // in seconds
    tasksCompleted: { type: Number, default: 0 },
    category: { type: String, default: "General" },
    completedAt: { type: Date, default: Date.now },
}, { timestamps: true });
const FocusSession = mongoose_1.default.model("FocusSession", focusSessionSchema);
exports.default = FocusSession;
//# sourceMappingURL=FocusSession.js.map