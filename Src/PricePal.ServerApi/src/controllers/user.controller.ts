import type { Request, Response } from "express";
import ShoppingCartService from "../services/shopping-cart.service.js";

export default class UserController {
  private static shoppingCartService: ShoppingCartService =
    new ShoppingCartService();

  static async getShoppingCart(req: Request, res: Response) {
    const publicUserId = req.params.publicUserId;

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
}
