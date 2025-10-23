import { Router } from "express";
import ProductsController from "../controllers/product.controller.js";

const router = Router();

// GET /products?section=top|our-choice|kaufland|lidl|billa|tmarket&offset=0&limit=4
router.get("/", ProductsController.getOverview);

// GET /products/:id
router.get("/:id", ProductsController.getProductById);

export default router;
