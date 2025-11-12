import { asc, eq, inArray, lte, gte, isNull, and, or } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import { price, product, storeChain } from "../db/migrations/schema.js";
import type { StoreChainName } from "../models/store-chain.model.js";

export default class PriceRepository {
  async getLowestPricePerProduct() {
    const now = new Date().toISOString();

    // Fetch all prices valid now, ordered by product and price ascending
    const rows = await db
      .select({
        id: price.id,
        productId: price.productId,
        priceBgn: price.priceBgn,
        priceEur: price.priceEur,
      })
      .from(price)
      .where(
        and(
          lte(price.validFrom, now),
          or(isNull(price.validTo), gte(price.validTo, now))
        )
      )
      .orderBy(asc(price.priceBgn), asc(price.priceEur));

    // Group by productId in JS and take the first (lowest) price per product
    const map = new Map<
      number,
      {
        id: number;
        productId: number;
        priceBgn: number | null;
        priceEur: number | null;
      }
    >();
    for (const r of rows) {
      const pid = r.productId as number;
      if (!map.has(pid)) {
        map.set(pid, r as any);
      }
    }

    return Array.from(map.values()).map((r) => ({
      id: r.id,
      productId: r.productId,
    }));
  }

  async getBiggestDiscountPerProduct() {
    const now = new Date().toISOString();

    // Fetch all prices valid now, ordered by product and discount ascending (biggest discount first)
    const rows = await db
      .select({
        id: price.id,
        productId: price.productId,
        discount: price.discount,
      })
      .from(price)
      .where(
        and(
          lte(price.validFrom, now),
          or(isNull(price.validTo), gte(price.validTo, now))
        )
      )
      .orderBy(asc(price.discount));

    // Group by productId in JS and take the first (biggest discount) price per product
    const map = new Map<
      number,
      { id: number; productId: number; discount: string | null }
    >();
    for (const r of rows) {
      const pid = r.productId as number;
      if (!map.has(pid)) {
        map.set(pid, r as any);
      }
    }

    return Array.from(map.values()).map((r) => ({
      id: r.id,
      productId: r.productId,
      discount: r.discount,
    }));
  }

  async getBiggestDiscountPerProductByStoreChain(chain: StoreChainName) {
    const now = new Date().toISOString();

    // Fetch all prices valid now for the given store chain, ordered by product and discount ascending
    const rows = await db
      .select({
        id: price.id,
        productId: price.productId,
        discount: price.discount,
      })
      .from(price)
      .leftJoin(storeChain, eq(price.chainId, storeChain.id))
      .where(
        and(
          eq(storeChain.name, chain),
          lte(price.validFrom, now),
          or(isNull(price.validTo), gte(price.validTo, now))
        )
      )
      .orderBy(asc(price.discount));

    // Group by productId in JS and take the first (biggest discount) price per product
    const map = new Map<
      number,
      { id: number; productId: number; discount: string | null }
    >();
    for (const r of rows) {
      const pid = r.productId as number;
      if (!map.has(pid)) {
        map.set(pid, r as any);
      }
    }

    return Array.from(map.values()).map((r) => ({
      id: r.id,
      productId: r.productId,
      discount: r.discount,
    }));
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
