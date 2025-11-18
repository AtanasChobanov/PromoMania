import type { Request, Response, NextFunction } from "express";
import JwtHelper from "../utils/jwt.helper.js";
import type { AccessTokenPayload } from "../models/token-payload.model.js";

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

export default class AuthMiddleware {
  static authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const parts = authHeader.split(" ");
    const token = parts[1];

    if (parts.length !== 2 || parts[0] !== "Bearer" || !token) {
      return res
        .status(401)
        .json({ message: "Invalid Authorization header format" });
    }

    try {
      const payload = JwtHelper.verifyAccessToken(token) as AccessTokenPayload;
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }
}
