import express from "express";
import { createTask, getTasks, updateTask, deleteTask } from "../controller/taskController";
import { protect } from "../middleware/authmiddleware";
const router = express.Router();
// Protect all routes
router.use(protect);
router.post("/", protect, createTask); // Create task
router.get("/", protect, getTasks); // Get all tasks
router.put("/:id", protect, updateTask); // Update task
router.delete("/:id", protect, deleteTask); // Delete task
export default router;
//# sourceMappingURL=taskRoutes.js.map