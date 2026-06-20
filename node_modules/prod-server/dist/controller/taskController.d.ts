import { Request, Response } from "express";
interface AuthRequest extends Request {
    user?: {
        _id: string;
    };
}
export declare const createTask: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTasks: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateTask: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTask: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=taskController.d.ts.map