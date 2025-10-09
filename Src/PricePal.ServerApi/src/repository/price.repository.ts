import { asc } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import { price } from "../db/migrations/schema.js";

export default class PriceRepository {
  async getLowestPricePerProduct() {
    return await db
      .selectDistinctOn([price.productId], {
        id: price.id,
      })
      .from(price)
      .orderBy(asc(price.productId), asc(price.priceBgn), asc(price.priceEur))
      .limit(6);
  }

  async getBiggestDiscountPerProduct() {
    return await db
      .select({
        id: price.id,
        productId: price.productId,
        discount: price.discount,
      })
      .from(price)
      .orderBy(asc(price.discount));
  }
}
