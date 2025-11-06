CREATE TABLE "ShoppingCart" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"total_cost_bgn" numeric(10, 2) NOT NULL,
	"total_cost_eur" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ShoppingCart_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE "ShoppingCartItem" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_price_bgn" numeric(10, 2) NOT NULL,
	"total_price_eur" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ShoppingCart" ADD CONSTRAINT "ShoppingCart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ShoppingCartItem" ADD CONSTRAINT "ShoppingCartItem_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."ShoppingCart"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ShoppingCartItem" ADD CONSTRAINT "ShoppingCartItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "ShoppingCart_public_id_key" ON "ShoppingCart" USING btree ("public_id");