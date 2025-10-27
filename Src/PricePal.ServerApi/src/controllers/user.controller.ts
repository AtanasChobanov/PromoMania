import type { Request, Response } from "express";
import ShoppingCartService from "../services/shopping-cart.service.js";

export default class UserController {
  private static shoppingCartService: ShoppingCartService =
    new ShoppingCartService();

  static async getShoppingCart(req: Request, res: Response) {
    const publicUserId = req.params.publicUserId;
    if (!publicUserId) {
      return res
        .status(400)
        .json({ message: "Missing publicUserId parameter." });
    }

    try {
      const cart =
        await UserController.shoppingCartService.getShoppingCartByPublicUserId(
          publicUserId
        );
      if (!cart) {
        return res
          .status(404)
          .json({ message: "Cart not found for this user" });
      }

      return res.status(200).json(cart);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async addItemToCart(req: Request, res: Response) {
    const { publicUserId } = req.params;
    const publicProductId = req.body.publicProductId as string | undefined;
    const quantity = req.body.quantity as string | undefined;

    if (!publicUserId || !publicProductId) {
      return res
        .status(400)
        .json({ message: "publicUserId and publicProductId are required" });
    }

    try {
      await UserController.shoppingCartService.addItemToShoppingCart(
        publicUserId,
        publicProductId,
        quantity ? +quantity : undefined
      );
      res.status(201).json({ message: "Item added to cart successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  }
}
