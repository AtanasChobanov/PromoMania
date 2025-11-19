import { Router } from "express";
import ShoppingCartController from "../controllers/shopping-cart.controller.js";

const router = Router({ mergeParams: true });

// GET /shopping-cart
router.get("/", ShoppingCartController.getShoppingCart);

// POST /shopping-cart/items
router.post("/items", ShoppingCartController.addItemToCart);

// PATCH /shopping-cart/items/:publicItemId
router.patch("/items/:publicItemId", ShoppingCartController.updateCartItem);

// DELETE /shopping-cart/items/:publicItemId
router.delete("/items/:publicItemId", ShoppingCartController.deleteCartItem);

// GET /shopping-cart/suggest-store
router.get("/suggest", ShoppingCartController.suggestBestStore);

export default router;
