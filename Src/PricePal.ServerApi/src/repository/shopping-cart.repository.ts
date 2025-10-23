import { eq } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import {
  product,
  shoppingCart,
  shoppingCartItem,
} from "../db/migrations/schema.js";

export class ShoppingCartRepository {
  async findByUserId(userId: number) {
    return await db
      .select()
      .from(shoppingCart)
      .leftJoin(shoppingCartItem, eq(shoppingCartItem.cartId, shoppingCart.id))
      .leftJoin(product, eq(product.id, shoppingCartItem.productId))
      .where(eq(shoppingCart.userId, userId));
  }
}
