import mongoose, { Schema } from "mongoose";
const taskSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model("Task", taskSchema);
export default Task;
//# sourceMappingURL=Task.js.map