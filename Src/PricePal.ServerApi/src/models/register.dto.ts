import { z } from "zod";

const strongPassword = z
  .string()
  .min(8)
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(
    /[!@#$%^&*()\-_=+\[\]{};:'"\\|,.<>\/?]/,
    "Must contain at least one special character"
  );

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: strongPassword,
});

export type RegisterDto = z.infer<typeof registerSchema>;
