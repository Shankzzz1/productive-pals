import { Request, Response } from "express";
interface AuthRequest extends Request {
    user?: any;
}
export declare const saveSession: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSessions: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=focusController.d.ts.map