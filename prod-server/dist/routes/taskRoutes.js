"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controller/taskController");
const authmiddleware_1 = require("../middleware/authmiddleware");
const router = express_1.default.Router();
// Protect all routes
router.use(authmiddleware_1.protect);
router.post("/", taskController_1.createTask); // Create task
router.get("/", taskController_1.getTasks); // Get all tasks
router.put("/:id", taskController_1.updateTask); // Update task
router.delete("/:id", taskController_1.deleteTask); // Delete task
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map