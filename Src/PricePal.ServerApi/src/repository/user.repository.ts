import { eq } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import { user } from "../db/migrations/schema.js";

export class UserRepository {
  async findByPublicId(publicId: string) {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.publicId, publicId));
    return result[0] || null;
  }
}
