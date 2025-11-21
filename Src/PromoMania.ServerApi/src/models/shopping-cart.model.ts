import { type InferSelectModel } from "drizzle-orm";
import { shoppingCart } from "../db/migrations/schema.js";

export type ShoppingCart = InferSelectModel<typeof shoppingCart>;
