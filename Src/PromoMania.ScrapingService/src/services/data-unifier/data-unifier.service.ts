import gemini from "../../config/gemini/gemini-client.config.js";
import type { IScrapableProduct } from "../../models/scraper.model.js";
import { getUnifyPrompt } from "../../config/gemini/promts/systemInstructions.config.js";
import prisma from "../../config/prisma-client.config.js";
import type { UnifiedProduct } from "../../models/product.model.js";
import { Type } from "@google/genai";
import BatchHelper from "../../utils/batch.helper.js";
import type { Category } from "@prisma/client";

export default class DataUnifierService {
  private static readonly BATCH_SIZE = 20;
  private static readonly CONCURRENCY_LIMIT = 3;
  private static readonly DELAY_BETWEEN_BATCHES_MS = 35000;
  private unifiedProductSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        chainPrices: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              chain: { type: Type.STRING },
              priceBgn: { type: Type.NUMBER },
              priceEur: { type: Type.NUMBER },
              oldPriceBgn: { type: Type.NUMBER },
              oldPriceEur: { type: Type.NUMBER },
              validFrom: { type: Type.STRING },
              validTo: { type: Type.STRING },
              discount: { type: Type.NUMBER },
            },
            required: [
              "chain",
              "priceBgn",
              "priceEur",
              "oldPriceBgn",
              "oldPriceEur",
              "validFrom",
              "validTo",
              "discount",
            ],
          },
        },
        category: { type: Type.STRING },
        name: { type: Type.STRING },
        unit: { type: Type.STRING },
        imageUrl: { type: Type.STRING },
      },
      required: ["chainPrices", "category", "name", "unit"],
    },
  };

  private async unifyBatch(
    categories: Category[],
    systemInstruction: string,
    batch: IScrapableProduct[]
  ): Promise<UnifiedProduct[]> {
    const input = JSON.stringify({ categories, products: batch });

    const response = await gemini.models.generateContent({
      model: "gemini-2.0-flash",
      contents: input,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: this.unifiedProductSchema,
        temperature: 0.2,
      },
    });

    const jsonResponse = response.text || "";

    try {
      const parsed: UnifiedProduct[] = JSON.parse(jsonResponse);

      // Convert all discount values to absolute values
      const productsWithAbsoluteDiscounts: UnifiedProduct[] = parsed.map(
        (product) => {
          const updatedChainPrices = product.chainPrices.map((cp) => {
            if (cp.discount) {
              cp.discount = Math.abs(cp.discount);
            }
            return cp;
          });
          product.chainPrices = updatedChainPrices;
          return product;
        }
      );

      return productsWithAbsoluteDiscounts.filter(
        (p) => p.category !== "Друго"
      );
    } catch (err) {
      console.error("❌ Failed to parse Gemini response:", jsonResponse);
      return [];
    }
  }

  async unifyAndFilterProducts(scrapedProducts: IScrapableProduct[]) {
    const categories = await prisma.category.findMany();
    const systemInstruction = getUnifyPrompt();

    const products = await BatchHelper.processInBatches(
      scrapedProducts,
      DataUnifierService.BATCH_SIZE,
      DataUnifierService.CONCURRENCY_LIMIT,
      DataUnifierService.DELAY_BETWEEN_BATCHES_MS,
      (batch) => this.unifyBatch(categories, systemInstruction, batch)
    );

    return products;
  }
}
