import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


 export interface JwtPayload {
  id: number;
  role: "admin" | "user";
}
export interface JwtPayload{
    id:number;
    role:"admin"| "user";
}
declare global{
    namespace Express{
        interface Request{
            user?:JwtPayload;
        }
    }
}
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication token is required",
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "invalid or expired token",
    });
  }
};
