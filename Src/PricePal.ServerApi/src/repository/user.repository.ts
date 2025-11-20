import { eq } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import { user, shoppingCart } from "../db/migrations/schema.js";

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
    return await db.transaction(async (tx) => {
      // Create user
      const [insertedUser] = await tx
        .insert(user)
        .values({
          email: payload.email,
          name: payload.name,
          passwordHash: payload.passwordHash,
        })
        .returning({
          id: user.id,
          publicId: user.publicId,
          email: user.email,
          name: user.name,
        });

      if (!insertedUser) {
        throw new Error("Failed to create user");
      }

      // Create shopping cart for the user
      await tx.insert(shoppingCart).values({
        userId: insertedUser.id,
        totalCostBgn: "0.00",
        totalCostEur: "0.00",
      });

      return {
        publicId: insertedUser.publicId,
        email: insertedUser.email,
        name: insertedUser.name,
      };
    });
  }
}
