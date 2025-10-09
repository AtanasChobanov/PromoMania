-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Store" (
	"id" serial PRIMARY KEY NOT NULL,
	"chain_id" integer NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"address" text
);
--> statement-breakpoint
CREATE TABLE "Category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Price" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"chain_id" integer NOT NULL,
	"price_bgn" numeric(10, 2) NOT NULL,
	"price_eur" numeric(10, 2) NOT NULL,
	"valid_from" timestamp(3) NOT NULL,
	"valid_to" timestamp(3),
	"discount" integer
);
--> statement-breakpoint
CREATE TABLE "StoreChain" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"base_url" text NOT NULL,
	"products_page" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Product" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"category_id" integer NOT NULL,
	"barcode" text,
	"image_url" text,
	"unit" text
);
--> statement-breakpoint
ALTER TABLE "Store" ADD CONSTRAINT "Store_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."StoreChain"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Price" ADD CONSTRAINT "Price_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "public"."StoreChain"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Price" ADD CONSTRAINT "Price_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Category"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product" USING btree ("barcode" text_ops);
*/