import { relations } from "drizzle-orm/relations";
import {
  storeChain,
  store,
  price,
  product,
  category,
  user,
  shoppingCart,
  shoppingCartItem,
} from "./schema.js";

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

export const userRelations = relations(user, ({ many }) => ({
  carts: many(shoppingCart),
}));

export const shoppingCartRelations = relations(
  shoppingCart,
  ({ one, many }) => ({
    user: one(user, {
      fields: [shoppingCart.userId],
      references: [user.id],
    }),
    items: many(shoppingCartItem),
  })
);

export const shoppingCartItemRelations = relations(
  shoppingCartItem,
  ({ one }) => ({
    cart: one(shoppingCart, {
      fields: [shoppingCartItem.cartId],
      references: [shoppingCart.id],
    }),
    product: one(product, {
      fields: [shoppingCartItem.productId],
      references: [product.id],
    }),
  })
);
