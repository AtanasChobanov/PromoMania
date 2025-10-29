import { eq } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import {
  product,
  shoppingCart,
  shoppingCartItem,
} from "../db/migrations/schema.js";

export default class ShoppingCartRepository {
  async findByUserId(userId: number) {
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

  async addItemToCart(cartId: number, productId: number, quantity: number) {
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

  async findCartByUserId(userId: number) {
    const result = await db
      .select()
      .from(shoppingCart)
      .where(eq(shoppingCart.userId, userId));
    return result[0] || null;
  }

  async findCartItemByProductId(cartId: number, productId: number) {
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

  async updateItemQuantity(publicId: string, quantity: number) {
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

  async findItemByPublicId(publicId: string) {
    const result = await db
      .select()
      .from(shoppingCartItem)
      .where(eq(shoppingCartItem.publicId, publicId));
    return result[0] || null;
  }
}
