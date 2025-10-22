import {
  pgTable,
  varchar,
  timestamp,
  text,
  integer,
  foreignKey,
  serial,
  numeric,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const prismaMigrations = pgTable("_prisma_migrations", {
  id: varchar({ length: 36 }).primaryKey().notNull(),
  checksum: varchar({ length: 64 }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
  migrationName: varchar("migration_name", { length: 255 }).notNull(),
  logs: text(),
  rolledBackAt: timestamp("rolled_back_at", {
    withTimezone: true,
    mode: "string",
  }),
  startedAt: timestamp("started_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const store = pgTable(
  "Store",
  {
    id: serial().primaryKey().notNull(),
    publicId: uuid("public_id").defaultRandom().notNull().unique(),
    chainId: integer("chain_id").notNull(),
    name: text().notNull(),
    city: text().notNull(),
    address: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.chainId],
      foreignColumns: [storeChain.id],
      name: "Store_chain_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const category = pgTable("Category", {
  id: serial().primaryKey().notNull(),
  publicId: uuid("public_id").defaultRandom().notNull().unique(),
  name: text().notNull(),
});

export const price = pgTable(
  "Price",
  {
    id: serial().primaryKey().notNull(),
    productId: integer("product_id").notNull(),
    chainId: integer("chain_id").notNull(),
    priceBgn: numeric("price_bgn", { precision: 10, scale: 2 }).notNull(),
    priceEur: numeric("price_eur", { precision: 10, scale: 2 }).notNull(),
    validFrom: timestamp("valid_from", {
      precision: 3,
      mode: "string",
    }).notNull(),
    validTo: timestamp("valid_to", { precision: 3, mode: "string" }),
    discount: integer(),
  },
  (table) => [
    foreignKey({
      columns: [table.chainId],
      foreignColumns: [storeChain.id],
      name: "Price_chain_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [product.id],
      name: "Price_product_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);

export const storeChain = pgTable("StoreChain", {
  id: serial().primaryKey().notNull(),
  publicId: uuid("public_id").defaultRandom().notNull().unique(),
  name: text().notNull(),
  baseUrl: text("base_url").notNull(),
  productsPage: text("products_page").notNull(),
});

export const product = pgTable(
  "Product",
  {
    id: serial().primaryKey().notNull(),
    publicId: uuid("public_id").defaultRandom().notNull().unique(),
    name: text().notNull(),
    brand: text(),
    categoryId: integer("category_id").notNull(),
    barcode: text(),
    imageUrl: text("image_url"),
    unit: text(),
  },
  (table) => [
    uniqueIndex("Product_barcode_key").using(
      "btree",
      table.barcode.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [category.id],
      name: "Product_category_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
);
