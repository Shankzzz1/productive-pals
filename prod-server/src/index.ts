import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import userRoutes from "./routes/RegUserRoutes";

const app = express();
const PORT = 5000;

connectDB();

// Middleware
app.use(express.json());
app.use(cors()); 

// Simple route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api/users", userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
