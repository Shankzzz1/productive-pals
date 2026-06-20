import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  user: mongoose.Schema.Types.ObjectId;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const taskSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model<ITask>("Task", taskSchema);
export default Task;
