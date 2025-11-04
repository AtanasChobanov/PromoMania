import { eq, inArray, asc, SQL, type AnyColumn } from "drizzle-orm";
import { db } from "../config/drizzle-client.config.js";
import {
  product,
  price,
  category,
  storeChain,
} from "../db/migrations/schema.js";

export default class ProductRepository {
  static readonly DEFAULT_OFFSET = 0;
  static readonly DEFAULT_LIMIT = 4;

  constructor(
    private pricesFieldsForOverview = {
      publicId: product.publicId,
      name: product.name,
      brand: product.brand,
      barcode: product.barcode,
      imageUrl: product.imageUrl,
      unit: product.unit,
      priceBgn: price.priceBgn,
      priceEur: price.priceEur,
      discount: price.discount,
    }
  ) {}

  async getOrderedByPrice(
    priceIds: { id: number; productId?: number }[],
    pagination?: { offset?: number; limit?: number }
  ) {
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
      .limit((pagination?.limit || ProductRepository.DEFAULT_LIMIT) + 1)
      .offset(pagination?.offset || ProductRepository.DEFAULT_OFFSET);
  }

  async getOrderedByDiscount(
    priceIds: { id: number }[],
    pagination?: { offset?: number; limit?: number }
  ) {
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
      .limit((pagination?.limit || ProductRepository.DEFAULT_LIMIT) + 1)
      .offset(pagination?.offset || ProductRepository.DEFAULT_OFFSET);
  }

  async getByPublicId(publicId: string) {
    const result = await db
      .select()
      .from(product)
      .where(eq(product.publicId, publicId));
    return result[0] || null;
  }

  async getDetailsByPublicId(publicProductId: string) {
    return await db
      .select({
        product: {
          publicId: product.publicId,
          name: product.name,
          brand: product.brand,
          barcode: product.barcode,
          imageUrl: product.imageUrl,
          unit: product.unit,
        },
        category: {
          name: category.name,
          publicId: category.publicId,
        },
        price: {
          priceBgn: price.priceBgn,
          priceEur: price.priceEur,
          validFrom: price.validFrom,
          validTo: price.validTo,
          discount: price.discount,
        },
        storeChain: {
          publicId: storeChain.publicId,
          name: storeChain.name,
        },
      })
      .from(product)
      .leftJoin(category, eq(category.id, product.categoryId))
      .leftJoin(price, eq(price.productId, product.id))
      .leftJoin(storeChain, eq(storeChain.id, price.chainId))
      .where(eq(product.publicId, publicProductId));
  }

  /**
   * Fetches the lowest prices for multiple products in a single query.
   *
   * This method solves the N+1 query problem where we would otherwise need to make
   * a separate query for each product to get its lowest price. The N+1 problem occurs
   * when we need to fetch related data for N items, resulting in N additional queries
   * (1 query for the main list + N queries for each item's details).
   *
   * Instead of making N separate queries, this method:
   * 1. Takes an array of product public IDs
   * 2. Makes a single query with a subquery to find the lowest price for each product
   * 3. Returns the results in a single round-trip to the database
   *
   * @param publicProductIds - Array of product public IDs to fetch prices for
   * @returns Array of products with their lowest prices and associated discounts
   */
  async getBatchedLowestPrices(publicProductIds: string[]) {
    // First, get all prices for the requested products
    const results = await db
      .select({
        productPublicId: product.publicId,
        name: product.name,
        brand: product.brand,
        barcode: product.barcode,
        imageUrl: product.imageUrl,
        unit: product.unit,
        priceBgn: price.priceBgn,
        priceEur: price.priceEur,
        discount: price.discount,
      })
      .from(product)
      .leftJoin(price, eq(price.productId, product.id))
      .where(inArray(product.publicId, publicProductIds))
      .orderBy(price.priceBgn);

    // Group by product and take the lowest price for each
    const productMap = new Map<string, (typeof results)[0]>();
    for (const row of results) {
      if (!productMap.has(row.productPublicId) && row.priceBgn !== null) {
        productMap.set(row.productPublicId, row);
      }
    }

    // Transform to final format
    return Array.from(productMap.values()).map((row) => ({
      publicId: row.productPublicId,
      name: row.name,
      brand: row.brand,
      barcode: row.barcode,
      imageUrl: row.imageUrl,
      unit: row.unit,
      priceBgn: row.priceBgn ? Number(row.priceBgn) : null,
      priceEur: row.priceEur ? Number(row.priceEur) : null,
      discount: row.discount,
    }));
  }
}
