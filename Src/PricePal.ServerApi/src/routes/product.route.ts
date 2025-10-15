import { Router, type Request, type Response } from "express";
import ProductsController from "../controllers/product.controller.js";

const router = Router();

// GET /products?section=top|our-choice|kaufland|lidl|billa|tmarket
router.get("/", ProductsController.getOverview);

export default router;
