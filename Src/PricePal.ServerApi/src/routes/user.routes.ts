import { Router } from "express";
import UserController from "../controllers/user.controller.js";

const router = Router({ mergeParams: true });

// GET /users/:publicUserId/shopping-cart
router.get("/shopping-cart", UserController.getShoppingCart);

export default router;
