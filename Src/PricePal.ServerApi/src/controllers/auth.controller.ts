import type { Request, Response } from "express";
import AuthService from "../services/auth.service.js";
import { registerSchema } from "../models/register.dto.js";
import z from "zod";
import { loginSchema } from "../models/login.dto.js";

export default class AuthController {
  private static authService: AuthService = new AuthService();

  static async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    try {
      const result = await AuthController.authService.register(parsed.data);
      return res.status(201).json(result);
    } catch (err: any) {
      console.error("Register error:", err);
      const status: number = err.status || 500;
      const message: string = err.message || "Internal server error";
      return res.status(status).json({ error: message });
    }
  }

  static async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: z.treeifyError(parsed.error),
      });
    }

    try {
      const result = await AuthController.authService.login(parsed.data);
      return res.status(201).json(result);
    } catch (err: any) {
      console.error("Login error:", err);
      const status: number = err.status || 500;
      const message: string = err.message || "Internal server error";
      return res.status(status).json({ error: message });
    }
  }
}
