import { type InferSelectModel } from "drizzle-orm";
import { price } from "../db/migrations/schema.js";

export type Price = InferSelectModel<typeof price>;
