import { eq } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import {
  product,
  shoppingCart,
  shoppingCartItem,
} from "../db/migrations/schema.js";

export default class ShoppingCartRepository {
  async getDetailsByUserId(userId: number) {
    return await db
      .select({
        cart: {
          publicId: shoppingCart.publicId,
          createdAt: shoppingCart.createdAt,
        },
        item: {
          quantity: shoppingCartItem.quantity,
        },
        product: {
          publicId: product.publicId,
          name: product.name,
          brand: product.brand,
          barcode: product.barcode,
          imageUrl: product.imageUrl,
          unit: product.unit,
        },
      })
      .from(shoppingCart)
      .leftJoin(shoppingCartItem, eq(shoppingCartItem.cartId, shoppingCart.id))
      .leftJoin(product, eq(product.id, shoppingCartItem.productId))
      .where(eq(shoppingCart.userId, userId));
  }

  async getByUserId(userId: number) {
    const result = await db
      .select()
      .from(shoppingCart)
      .where(eq(shoppingCart.userId, userId));
    return result[0] || null;
  }
}
