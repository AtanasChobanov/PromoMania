import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import { price, product, storeChain } from "../db/migrations/schema.js";
import type { StoreChainName } from "../models/store-chain.model.js";

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
      .orderBy(asc(price.discount), asc(price.validFrom), asc(price.validTo));
  }

  async getBiggestDiscountPerProductByStoreChain(chain: StoreChainName) {
    const results = await db
      .select({
        id: price.id,
        productId: price.productId,
      })
      .from(price)
      .leftJoin(storeChain, eq(price.chainId, storeChain.id))
      .where(eq(storeChain.name, chain))
      .orderBy(asc(price.discount), asc(price.validFrom), asc(price.validTo));

    return results;
  }

  /**
   * Get all prices for a list of products, including store chain information
   * Prices are ordered by price (BGN) ascending for each product
   */
  async getAllPricesForProducts(productIds: number[]) {
    return await db
      .select({
        productPublicId: product.publicId,
        priceBgn: price.priceBgn,
        priceEur: price.priceEur,
        discount: price.discount,
        validFrom: price.validFrom,
        validTo: price.validTo,
        storeChain: {
          publicId: storeChain.publicId,
          name: storeChain.name,
        },
      })
      .from(price)
      .leftJoin(product, eq(price.productId, product.id))
      .leftJoin(storeChain, eq(price.chainId, storeChain.id))
      .where(inArray(product.id, productIds))
      .orderBy(product.id, price.priceBgn);
  }
}
