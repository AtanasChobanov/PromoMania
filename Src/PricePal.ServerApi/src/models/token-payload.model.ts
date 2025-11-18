import type { JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
  publicId: string;
  email: string;
  name: string;
}
