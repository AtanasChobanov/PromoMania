import { Router, type Request, type Response } from "express";
import ProductsController from "../controllers/product.controller.js";

const router = Router();

// GET /products
router.get("/overview", ProductsController.getOverview);

export default router;
