import type { Request, Response } from "express";
import ShoppingCartService from "../services/shopping-cart.service.js";
import ShoppingCartItemService from "../services/shopping-cart-item.service.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import StoreSuggestionService from "../services/store-suggestion.service.js";

export default class ShoppingCartController {
  private static shoppingCartService: ShoppingCartService =
    new ShoppingCartService();
  private static shoppingCartItemService: ShoppingCartItemService =
    new ShoppingCartItemService();
  private static storeSuggestionService: StoreSuggestionService =
    new StoreSuggestionService();

  static async getShoppingCart(req: AuthenticatedRequest, res: Response) {
    try {
      const cart =
        await ShoppingCartController.shoppingCartService.getShoppingCartByPublicUserId(
          req.user!.publicId
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

  static async addItemToCart(req: AuthenticatedRequest, res: Response) {
    const publicProductId = req.body.publicProductId as string | undefined;
    const quantity = req.body.quantity as string | undefined;

    if (!publicProductId) {
      return res.status(400).json({ message: "publicProductId is required" });
    }

    try {
      const item =
        await ShoppingCartController.shoppingCartItemService.addItemToCart(
          req.user!.publicId,
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
    const { publicItemId } = req.params;
    const quantity = req.body.quantity as number | undefined;

    if (!publicItemId || quantity === undefined) {
      return res.status(400).json({
        message: "publicItemId and quantity are required",
      });
    }

    if (quantity < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    try {
      const updatedItem =
        await ShoppingCartController.shoppingCartItemService.update(
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

  static async deleteCartItem(req: Request, res: Response) {
    const { publicItemId } = req.params;

    if (!publicItemId) {
      return res.status(400).json({
        message: "publicItemId is required",
      });
    }

    try {
      const deletedItem =
        await ShoppingCartController.shoppingCartItemService.delete(
          publicItemId
        );

      res.status(200).json({
        message: "Cart item deleted successfully",
        item: deletedItem,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message === "Cart item not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ error: "Failed to delete cart item" });
    }
  }

  static async suggestBestStore(req: AuthenticatedRequest, res: Response) {
    try {
      const cartWithAllPrices =
        await ShoppingCartController.storeSuggestionService.suggestCheapestStoreOption(
          req.user!.publicId
        );

      if (!cartWithAllPrices) {
        return res
          .status(404)
          .json({ message: "Cart not found for this user" });
      }

      return res.status(200).json(cartWithAllPrices);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
