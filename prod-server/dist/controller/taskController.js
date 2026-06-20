"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTasks = exports.createTask = void 0;
const Task_1 = __importDefault(require("../model/Task"));
// Create a new task
const createTask = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text)
            return res.status(400).json({ message: "Task text is required" });
        const task = new Task_1.default({
            user: req.user._id,
            text,
            completed: false,
        });
        await task.save();
        res.status(201).json(task);
    }
    catch (err) {
        console.error("CreateTask Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.createTask = createTask;
// Get all tasks for the logged-in user
const getTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    }
    catch (err) {
        console.error("GetTasks Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getTasks = getTasks;
// Update a task (text or completed)
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, completed } = req.body;
        const task = await Task_1.default.findOne({ _id: id, user: req.user._id });
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        if (text !== undefined)
            task.text = text;
        if (completed !== undefined)
            task.completed = completed;
        await task.save();
        res.status(200).json(task);
    }
    catch (err) {
        console.error("UpdateTask Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateTask = updateTask;
// Delete a task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task_1.default.findOneAndDelete({ _id: id, user: req.user._id });
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        res.status(200).json({ message: "Task deleted successfully", id: task._id });
    }
    catch (err) {
        console.error("DeleteTask Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=taskController.js.map