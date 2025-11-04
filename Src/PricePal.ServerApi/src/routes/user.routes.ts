import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import StoreSuggestionController from "../controllers/shopping-suggestion.controller.js";

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

// DELETE /users/:publicUserId/shopping-cart/items/:publicItemId
router.delete(
  "/shopping-cart/items/:publicItemId",
  UserController.deleteCartItem
);

// GET /users/:publicUserId/shopping-cart/suggest-store
router.get("/shopping-cart/suggest", StoreSuggestionController.suggest);

export default router;
