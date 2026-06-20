import jwt from "jsonwebtoken";
import User from "../model/User";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Not authorized, token missing" });
            }
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        }
        catch (err) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
};
//# sourceMappingURL=authmiddleware.js.map