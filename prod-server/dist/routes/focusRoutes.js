"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/focusRoutes.ts
const express_1 = __importDefault(require("express"));
const focusController_1 = require("../controller/focusController");
const authmiddleware_1 = require("../middleware/authmiddleware");
const router = express_1.default.Router();
router.post("/", authmiddleware_1.protect, focusController_1.saveSession); // Save a completed session
router.get("/", authmiddleware_1.protect, focusController_1.getSessions); // Get all sessions of a user
exports.default = router;
//# sourceMappingURL=focusRoutes.js.map