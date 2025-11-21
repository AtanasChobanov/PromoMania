import type { UnifiedProduct } from "../../models/product.model.js";
import CategoryService from "../category/category.service.js";
import prisma from "../../config/prisma-client.config.js";

export default class ProductService {
  async getOrCreateProduct(product: UnifiedProduct) {
    const categoryService = new CategoryService();
    const category = await categoryService.getOrCreateCategory(
      product.category
    );

    let existing = await prisma.product.findFirst({
      where: {
        name: product.name,
        brand: product.brand || null,
        category_id: category.id,
      },
    });

    if (!existing) {
      existing = await prisma.product.create({
        data: {
          name: product.name,
          brand: product.brand || null,
          image_url: product.imageUrl ?? null,
          category_id: category.id,
          barcode: null,
          unit: product.unit,
        },
      });
    }

    return existing;
  }
}
