import { relations } from "drizzle-orm/relations";
import { storeChain, store, price, product, category } from "./schema.js";

export const storeRelations = relations(store, ({ one }) => ({
  storeChain: one(storeChain, {
    fields: [store.chainId],
    references: [storeChain.id],
  }),
}));

export const storeChainRelations = relations(storeChain, ({ many }) => ({
  stores: many(store),
  prices: many(price),
}));

export const priceRelations = relations(price, ({ one }) => ({
  storeChain: one(storeChain, {
    fields: [price.chainId],
    references: [storeChain.id],
  }),
  product: one(product, {
    fields: [price.productId],
    references: [product.id],
  }),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  prices: many(price),
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  products: many(product),
}));
