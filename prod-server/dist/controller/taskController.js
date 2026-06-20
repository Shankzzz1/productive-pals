import Task from "../model/Task";
// Create a new task
export const createTask = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text)
            return res.status(400).json({ message: "Task text is required" });
        const task = new Task({
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
// Get all tasks for the logged-in user
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    }
    catch (err) {
        console.error("GetTasks Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
// Update a task (text or completed)
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, completed } = req.body;
        const task = await Task.findOne({ _id: id, user: req.user._id });
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
// Delete a task
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });
        if (!task)
            return res.status(404).json({ message: "Task not found" });
        res.status(200).json({ message: "Task deleted successfully", id: task._id });
    }
    catch (err) {
        console.error("DeleteTask Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
//# sourceMappingURL=taskController.js.map