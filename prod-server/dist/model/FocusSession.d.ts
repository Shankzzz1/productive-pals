import mongoose from "mongoose";
declare const FocusSession: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    user: mongoose.Types.ObjectId;
    mode: "pomodoro" | "shortBreak" | "longBreak";
    duration: number;
    tasksCompleted: number;
    category: string;
    completedAt: NativeDate;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    user: mongoose.Types.ObjectId;
    mode: "pomodoro" | "shortBreak" | "longBreak";
    duration: number;
    tasksCompleted: number;
    category: string;
    completedAt: NativeDate;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    user: mongoose.Types.ObjectId;
    mode: "pomodoro" | "shortBreak" | "longBreak";
    duration: number;
    tasksCompleted: number;
    category: string;
    completedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    user: mongoose.Types.ObjectId;
    mode: "pomodoro" | "shortBreak" | "longBreak";
    duration: number;
    tasksCompleted: number;
    category: string;
    completedAt: NativeDate;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    user: mongoose.Types.ObjectId;
    mode: "pomodoro" | "shortBreak" | "longBreak";
    duration: number;
    tasksCompleted: number;
    category: string;
    completedAt: NativeDate;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    user: mongoose.Types.ObjectId;
    mode: "pomodoro" | "shortBreak" | "longBreak";
    duration: number;
    tasksCompleted: number;
    category: string;
    completedAt: NativeDate;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default FocusSession;
//# sourceMappingURL=FocusSession.d.ts.map