import type { Request, Response } from "express";
import StoreSuggestionService from "../services/store-suggestion.service.js";

export default class StoreSuggestionController {
  private static storeSuggestionService: StoreSuggestionService =
    new StoreSuggestionService();

  static async suggest(req: Request, res: Response) {
    const { publicUserId } = req.params;

    if (!publicUserId) {
      return res
        .status(400)
        .json({ message: "Missing publicUserId parameter" });
    }

    try {
      const cartWithAllPrices =
        await StoreSuggestionController.storeSuggestionService.suggestCheapestStoreOption(
          publicUserId
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
