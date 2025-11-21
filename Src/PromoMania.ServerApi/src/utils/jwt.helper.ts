import jwt from "jsonwebtoken";
import ms, { type StringValue } from "ms";

export default abstract class JwtHelper {
  private static readonly ACCESS_SECRET: jwt.Secret =
    process.env.JWT_ACCESS_SECRET || "";
  private static readonly ACCESS_EXPIRES =
    (process.env.JWT_ACCESS_EXPIRES as StringValue) || "15m";

  static {
    if (!this.ACCESS_SECRET) {
      throw new Error("Missing JWT_ACCESS_SECRET in environment");
    }
  }

  static signAccessToken(payload: object): string {
    return jwt.sign(payload, this.ACCESS_SECRET, {
      expiresIn: ms(this.ACCESS_EXPIRES),
    });
  }

  static verifyAccessToken(token: string) {
    return jwt.verify(token, this.ACCESS_SECRET);
  }
}
