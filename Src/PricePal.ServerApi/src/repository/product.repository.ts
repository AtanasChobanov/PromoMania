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
      id: product.id,
      publicId: product.publicId,
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

  async getById(productId: number) {
    return await db
      .select()
      .from(product)
      .leftJoin(category, eq(category.id, product.categoryId))
      .leftJoin(price, eq(price.productId, product.id))
      .leftJoin(storeChain, eq(storeChain.id, price.chainId))
      .where(eq(product.id, productId));
  }
}
