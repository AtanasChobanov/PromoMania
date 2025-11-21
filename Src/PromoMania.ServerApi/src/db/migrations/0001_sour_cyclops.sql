ALTER TABLE "Store" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "Category" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "StoreChain" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "Product" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "Store" ADD CONSTRAINT "Store_public_id_unique" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "Category" ADD CONSTRAINT "Category_public_id_unique" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "StoreChain" ADD CONSTRAINT "StoreChain_public_id_unique" UNIQUE("public_id");--> statement-breakpoint
ALTER TABLE "Product" ADD CONSTRAINT "Product_public_id_unique" UNIQUE("public_id");