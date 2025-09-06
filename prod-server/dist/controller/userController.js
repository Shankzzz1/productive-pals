"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../model/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        const newUser = new User_1.default({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({
            message: "User registered successfully",
            user: { username, email }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        // Check if user exists
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Compare password
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        // Create JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "7d" } // 7 days
        );
        // Return user info + token
        res.status(200).json({
            message: "Login successful",
            user: { username: user.username, email: user.email },
            token
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=userController.js.map