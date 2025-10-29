import type { Request, Response } from "express";
import ShoppingCartService from "../services/shopping-cart.service.js";
import ShoppingCartItemService from "../services/shopping-cart-item.service.js";

export default class UserController {
  private static shoppingCartService: ShoppingCartService =
    new ShoppingCartService();
  private static shoppingCartItemService: ShoppingCartItemService =
    new ShoppingCartItemService();

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
      const item =
        await UserController.shoppingCartItemService.addItemToShoppingCart(
          publicUserId,
          publicProductId,
          quantity ? +quantity : undefined
        );

      res.status(201).json({
        message: "Item added to cart successfully",
        item,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        if (error.message === "User or product not found") {
          return res.status(404).json({ message: error.message });
        }
        if (error.message === "Shopping cart not found") {
          return res.status(404).json({ message: error.message });
        }
      }
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  }

  static async updateCartItem(req: Request, res: Response) {
    const { publicUserId, publicItemId } = req.params;
    const quantity = req.body.quantity as number | undefined;

    if (!publicUserId || !publicItemId || quantity === undefined) {
      return res.status(400).json({
        message: "publicUserId, publicItemId and quantity are required",
      });
    }

    if (quantity < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    try {
      const updatedItem =
        await UserController.shoppingCartItemService.updateItemQuantity(
          publicItemId,
          quantity
        );

      res
        .status(200)
        .json({ message: "Cart item updated successfully", item: updatedItem });
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message === "Cart item not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ error: "Failed to update cart item" });
    }
  }
}
