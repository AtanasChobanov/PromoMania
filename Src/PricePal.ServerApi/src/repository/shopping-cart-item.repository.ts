import { eq } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import { shoppingCartItem } from "../db/migrations/schema.js";

export default class ShoppingCartItemRepository {
  async add(cartId: number, productId: number, quantity: number) {
    const result = await db
      .insert(shoppingCartItem)
      .values({
        cartId,
        productId,
        quantity,
        totalPriceBgn: "0",
        totalPriceEur: "0",
      })
      .returning({
        publicId: shoppingCartItem.publicId,
        quantity: shoppingCartItem.quantity,
        totalPriceBgn: shoppingCartItem.totalPriceBgn,
        totalPriceEur: shoppingCartItem.totalPriceEur,
      });
    return result[0] || null;
  }

  async getByProductId(cartId: number, productId: number) {
    const result = await db
      .select({
        publicId: shoppingCartItem.publicId,
        quantity: shoppingCartItem.quantity,
        totalPriceBgn: shoppingCartItem.totalPriceBgn,
        totalPriceEur: shoppingCartItem.totalPriceEur,
      })
      .from(shoppingCartItem)
      .where(
        eq(shoppingCartItem.cartId, cartId) &&
          eq(shoppingCartItem.productId, productId)
      );
    return result[0] || null;
  }

  async getByPublicId(publicId: string) {
    const result = await db
      .select()
      .from(shoppingCartItem)
      .where(eq(shoppingCartItem.publicId, publicId));
    return result[0] || null;
  }

  async update(publicId: string, quantity: number) {
    const result = await db
      .update(shoppingCartItem)
      .set({ quantity })
      .where(eq(shoppingCartItem.publicId, publicId))
      .returning({
        publicId: shoppingCartItem.publicId,
        quantity: shoppingCartItem.quantity,
        totalPriceBgn: shoppingCartItem.totalPriceBgn,
        totalPriceEur: shoppingCartItem.totalPriceEur,
      });
    return result[0] || null;
  }

  async delete(publicId: string) {
    const result = await db
      .delete(shoppingCartItem)
      .where(eq(shoppingCartItem.publicId, publicId))
      .returning({
        publicId: shoppingCartItem.publicId,
        quantity: shoppingCartItem.quantity,
        totalPriceBgn: shoppingCartItem.totalPriceBgn,
        totalPriceEur: shoppingCartItem.totalPriceEur,
      });
    return result[0] || null;
  }
}
