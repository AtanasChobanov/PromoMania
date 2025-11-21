import { type InferSelectModel } from "drizzle-orm";
import { product } from "../db/migrations/schema.js";

export type Product = InferSelectModel<typeof product>;
