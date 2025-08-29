import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import userRoutes from "./routes/RegUserRoutes";
import taskRoutes  from "./routes/taskRoutes";
import focusRoutes from "./routes/focusRoutes";

const app = express();
const PORT = 5000;

connectDB();

// Middleware
app.use(express.json());
// app.use(cors()); 

app.use(cors({
  origin: 'http://localhost:5173', // or your frontend URL
  credentials: true
}));

// Simple route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/focus", focusRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
