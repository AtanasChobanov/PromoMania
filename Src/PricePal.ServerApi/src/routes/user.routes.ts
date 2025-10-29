import { Router } from "express";
import UserController from "../controllers/user.controller.js";

const router = Router({ mergeParams: true });

// GET /users/:publicUserId/shopping-cart
router.get("/shopping-cart", UserController.getShoppingCart);

// POST /users/:publicUserId/shopping-cart/items
router.post("/shopping-cart/items", UserController.addItemToCart);

// PATCH /users/:publicUserId/shopping-cart/items/:publicItemId
router.patch(
  "/shopping-cart/items/:publicItemId",
  UserController.updateCartItem
);

export default router;
