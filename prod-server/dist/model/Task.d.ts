import mongoose, { Document } from "mongoose";
export interface ITask extends Document {
    user: mongoose.Schema.Types.ObjectId;
    text: string;
    completed: boolean;
    createdAt: Date;
}
declare const Task: mongoose.Model<ITask, {}, {}, {}, mongoose.Document<unknown, {}, ITask, {}, {}> & ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Task;
//# sourceMappingURL=Task.d.ts.map