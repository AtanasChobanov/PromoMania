import type { Product } from "@prisma/client";
import prisma from "../../config/prisma-client.config.js";
import type { ChainPrice } from "../../models/product.model.js";
import StoreChainService from "../store-chain/store-chain.service.js";
import { Decimal } from "@prisma/client/runtime/library";

export default class PriceService {
  private async handleRegularPrice(
    product: Product,
    chainId: number,
    chainPrice: ChainPrice
  ) {
    const validFrom = new Date(chainPrice.validFrom);

    // Check for existing active regular price
    const activeRegular = await prisma.price.findFirst({
      where: {
        product_id: product.id,
        chain_id: chainId,
        discount: 0,
        valid_to: null,
      },
    });

    try {
      // If there's a change in the regular price, update the old one and insert the new one
      if (
        activeRegular &&
        (+activeRegular.price_bgn !== chainPrice.oldPriceBgn ||
          +activeRegular.price_eur !== chainPrice.oldPriceEur)
      ) {
        await prisma.price.update({
          where: { id: activeRegular.id },
          data: { valid_to: validFrom },
        });

        await prisma.price.create({
          data: {
            product_id: product.id,
            chain_id: chainId,
            price_bgn: chainPrice.oldPriceBgn,
            price_eur: chainPrice.oldPriceEur,
            valid_from: validFrom,
            valid_to: null,
            discount: 0,
          },
        });
      } else if (!activeRegular) {
        await prisma.price.create({
          data: {
            product_id: product.id,
            chain_id: chainId,
            price_bgn: chainPrice.oldPriceBgn,
            price_eur: chainPrice.oldPriceEur,
            valid_from: validFrom,
            valid_to: null,
            discount: 0,
          },
        });
      }
    } catch (error) {
      console.log("Active Regular Price:", activeRegular);
      console.log("Chain Price:", chainPrice);
      console.log("Error updating/creating regular price: " + error);
    }
  }

  private async handlePromoPrice(
    product: Product,
    chainId: number,
    chainPrice: ChainPrice
  ) {
    const existingPromo = await prisma.price.findFirst({
      where: {
        product_id: product.id,
        chain_id: chainId,
        price_bgn: Decimal(chainPrice.priceBgn),
        price_eur: Decimal(chainPrice.priceEur),
        valid_to: chainPrice.validTo,
        discount: chainPrice.discount,
      },
    });

    if (!existingPromo) {
      try {
        await prisma.price.create({
          data: {
            product_id: product.id,
            chain_id: chainId,
            price_bgn: chainPrice.priceBgn,
            price_eur: chainPrice.priceEur,
            valid_from: chainPrice.validFrom,
            valid_to: chainPrice.validTo,
            discount: chainPrice.discount,
          },
        });
      } catch (error) {
        console.log("Error creating promo price: " + error);
      }
    }
  }

  async addPrices(product: Product, chainPrices: ChainPrice[]) {
    for (const chainPrice of chainPrices) {
      const storeChainService = new StoreChainService();
      const storeChain = await storeChainService.getStoreChain(
        chainPrice.chain
      );

      if (!storeChain) continue;

      // --- CASE 1: oldPrice + price (нормална + промо) ---
      if (chainPrice.oldPriceBgn && chainPrice.oldPriceEur) {
        await this.handleRegularPrice(product, storeChain.id, chainPrice);
        await this.handlePromoPrice(product, storeChain.id, chainPrice);
      }

      // --- CASE 2: само price ---
      else if (chainPrice.priceBgn && chainPrice.priceEur) {
        const isPromo = chainPrice.discount > 0;

        if (isPromo) {
          await this.handlePromoPrice(product, storeChain.id, chainPrice);
        } else {
          chainPrice.oldPriceBgn = chainPrice.priceBgn;
          chainPrice.oldPriceEur = chainPrice.priceEur;
          await this.handleRegularPrice(product, storeChain.id, chainPrice);
        }
      }
    }
  }
}
