import type { Request, Response } from "express";
import ProductService from "../services/product.service.js";

export default class ProductController {
  static async getOverview(req: Request, res: Response) {
    try {
      const productService = new ProductService();
      const products = await productService.getProductsOverview();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
