import type { Request, Response } from "express";
import ProductService from "../services/product.service.js";

export default class ProductController {
  private static productService: ProductService = new ProductService();

  static async getOverview(req: Request, res: Response) {
    try {
      const section = (req.query.section as string)?.toLowerCase();
      const offset = Number(req.query.offset);
      const limit = Number(req.query.limit);

      if (section && ProductService.isProductSectionName(section)) {
        const products =
          await ProductController.productService.getProductsOverview(section, {
            offset,
            limit,
          });
        return res.json(products);
      }

      return res
        .status(400)
        .json({ message: "Missing or invalid 'section' query parameter." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const productId = Number(req.params.id);
      if (!productId) {
        return res
          .status(400)
          .json({ message: "Missing product ID parameter." });
      }

      const product = await ProductController.productService.getProductById(
        productId
      );
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
