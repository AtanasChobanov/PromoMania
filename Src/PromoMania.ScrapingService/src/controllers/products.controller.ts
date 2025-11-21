import type { Request, Response } from "express";
import ScraperService from "../services/scraper/scraper.service.js";
import DataUnifierService from "../services/data-unifier/data-unifier.service.js";
import ProductService from "../services/product/product.service.js";
import pLimit from "p-limit";
import type { Product } from "@prisma/client";
import PriceService from "../services/price/price.service.js";
import type { IScrapableProduct } from "../models/scraper.model.js";

export default class ProductsController {
  private static async handleScrapedProducts(
    scrapedProducts: IScrapableProduct[]
  ) {
    // 1
    const dataUnifierService = new DataUnifierService();

    const unifiedProducts = await dataUnifierService.unifyAndFilterProducts(
      scrapedProducts
    );

    // 2
    const productService = new ProductService();
    const priceService = new PriceService();

    const limit = pLimit(10);

    // batch size
    const batchSize = 50;
    const results: Product[] = [];

    for (let i = 0; i < unifiedProducts.length; i += batchSize) {
      const batch = unifiedProducts.slice(i, i + batchSize);

      // every batch with products goes with concurrency limit
      const batchResults = await Promise.all(
        batch.map((productData) =>
          limit(async () => {
            const product = await productService.getOrCreateProduct(
              productData
            );

            // 3
            await priceService.addPrices(product, productData.chainPrices);

            return product;
          })
        )
      );

      results.push(...batchResults);
    }

    return results;
  }

  static async scrapeProducts(req: Request, res: Response) {
    const scraperService = new ScraperService();
    try {
      const products = await scraperService.scrapeAllSites();
      const results = await ProductsController.handleScrapedProducts(products);
      res.json(results);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
