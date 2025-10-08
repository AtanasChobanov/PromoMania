import type { Product } from "@prisma/client";
import prisma from "../config/prisma-client.config.js";
import ProductSection from "../models/product-section.model.js";
import { ProductSectionTitle } from "../models/product-section.model.js";

export default class ProductService {
  private async getCheapestProducts(): Promise<ProductSection> {
    const productData = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        category_id: true,
        barcode: true,
        image_url: true,
        unit: true,
        prices: {
          select: {
            price_bgn: true,
            price_eur: true,
            discount: true,
          },
          orderBy: [{ price_bgn: "asc" }, { price_eur: "asc" }],
          take: 1,
        },
      },
      take: 6,
    });

    return new ProductSection(
      ProductSectionTitle.CHEAPEST_PRODUCTS,
      productData
    );
  }

  private async getBiggestDiscounts(): Promise<ProductSection> {
    const productData = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        category_id: true,
        barcode: true,
        image_url: true,
        unit: true,
        prices: {
          select: {
            price_bgn: true,
            price_eur: true,
            discount: true,
          },
          orderBy: {
            discount: "asc",
          },
          take: 1,
        },
      },
      take: 6,
    });

    return new ProductSection(
      ProductSectionTitle.BIGGEST_DISCOUNTS,
      productData
    );
  }

  async getProductsOverview(): Promise<ProductSection[]> {
    const productsList: ProductSection[] = [];
    productsList.push(await this.getCheapestProducts());
    productsList.push(await this.getBiggestDiscounts());
    return productsList;
  }
}
