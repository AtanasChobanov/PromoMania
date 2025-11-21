/*
  Warnings:

  - A unique constraint covering the columns `[product_id,chain_id,price_bgn,price_eur,valid_from,valid_to,discount]` on the table `Price` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Price_product_id_chain_id_price_bgn_price_eur_valid_from_va_key" ON "public"."Price"("product_id", "chain_id", "price_bgn", "price_eur", "valid_from", "valid_to", "discount");
