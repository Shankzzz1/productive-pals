import express from "express";
import { createTask, getTasks, updateTask, deleteTask } from "../controller/taskController";
import { protect } from "../middleware/authmiddleware";

const router = express.Router();

// Protect all routes
router.use(protect);

router.post("/", createTask);          // Create task
router.get("/", getTasks);             // Get all tasks
router.put("/:id", updateTask);        // Update task
router.delete("/:id", deleteTask);     // Delete task

export default router;
