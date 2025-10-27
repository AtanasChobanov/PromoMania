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
}
