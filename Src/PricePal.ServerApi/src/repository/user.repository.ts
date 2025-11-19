import { eq } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import { user } from "../db/migrations/schema.js";

export default class UserRepository {
  async getByPublicId(publicId: string) {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.publicId, publicId))
      .limit(1);
    return result[0] || null;
  }

  async findUserByEmail(email: string) {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    return result[0] || null;
  }

  async createUser(payload: {
    email: string;
    name: string;
    passwordHash: string;
  }) {
    const [inserted] = await db
      .insert(user)
      .values({
        email: payload.email,
        name: payload.name,
        passwordHash: payload.passwordHash,
      })
      .returning({
        publicId: user.publicId,
        email: user.email,
        name: user.name,
      });

    return inserted;
  }
}
