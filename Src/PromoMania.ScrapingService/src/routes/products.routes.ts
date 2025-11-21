import { Router } from "express";
import ProductsController from "../controllers/products.controller.js";

const router = Router();

// GET /products
router.get("/", ProductsController.scrapeProducts);

// GET /products/test
// router.get("/test", ProductsController.test);

export default router;
