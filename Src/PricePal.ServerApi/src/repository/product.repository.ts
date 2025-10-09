import { eq, inArray, asc, SQL, type AnyColumn } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import { product, price } from "../db/migrations/schema.js";

export default class ProductRepository {
  constructor(
    private pricesFieldsForOverview = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      categoryId: product.categoryId,
      barcode: product.barcode,
      imageUrl: product.imageUrl,
      unit: product.unit,
      priceBgn: price.priceBgn,
      priceEur: price.priceEur,
      discount: price.discount,
    }
  ) {}

  async getOrderedByPrice(priceIds: { id: number; productId?: number }[]) {
    return await db
      .select(this.pricesFieldsForOverview)
      .from(product)
      .leftJoin(price, eq(price.productId, product.id))
      .where(
        inArray(
          price.id,
          priceIds.map((p) => p.id)
        )
      )
      .orderBy(asc(price.priceBgn), asc(price.priceEur))
      .limit(6);
  }

  async getOrderedByDiscount(priceIds: { id: number }[]) {
    return await db
      .select(this.pricesFieldsForOverview)
      .from(product)
      .leftJoin(price, eq(price.productId, product.id))
      .where(
        inArray(
          price.id,
          priceIds.map((p) => p.id)
        )
      )
      .orderBy(asc(price.discount))
      .limit(6);
  }
}
