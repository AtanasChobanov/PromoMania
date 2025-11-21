import type { Page } from "puppeteer";
import type {
  IScrapableProduct,
  IScraper,
} from "../../models/scraper.model.js";
import prisma from "../../config/prisma-client.config.js";
import { Type } from "@google/genai";
import gemini from "../../config/gemini/gemini-client.config.js";
import { getCategoryMatchWhithSectionPrompt } from "../../config/gemini/promts/systemInstructions.config.js";
import type { IScrapedCategorySection } from "../../models/scraped-category.model.js";

export default class KauflandScraperService implements IScraper {
  readonly CHAIN_NAME = "Kaufland";

  private async extractSectionData(
    page: Page,
    section: IScrapedCategorySection,
    validFrom: string,
    validTo: string
  ) {
    return await page.$$eval(
      `.k-product-section#${section.sectionId} .k-product-tile`,
      (products, storeChainName, category, validFrom, validTo) => {
        return products.map((item) => {
          const title =
            item.querySelector(".k-product-tile__title")?.textContent?.trim() ??
            "";
          const subtitle =
            item
              .querySelector(".k-product-tile__subtitle")
              ?.textContent?.trim() ?? "";
          const name = `${title} ${subtitle}`.trim();

          const unit =
            item
              .querySelector(".k-product-tile__unit-price")
              ?.textContent?.trim() || "";

          const prices = item.querySelectorAll(".k-price-tag__price");
          const priceBgn = prices[0]?.textContent?.trim() || "";
          const priceEur = prices[1]?.textContent?.trim() || "";

          const oldPrices = item.querySelectorAll(".k-price-tag__old-price");
          const oldPriceBgn = oldPrices[0]?.textContent?.trim() || "";
          const oldPriceEur = oldPrices[1]?.textContent?.trim() || "";

          const discount =
            item.querySelector(".k-price-tag__discount")?.textContent?.trim() ||
            "";

          const imageUrl =
            (
              item.querySelector(
                ".k-product-tile__main-image"
              ) as HTMLImageElement
            )?.src || "";

          return {
            chain: storeChainName,
            category,
            name,
            unit,
            priceBgn,
            priceEur,
            oldPriceBgn,
            oldPriceEur,
            validFrom,
            validTo,
            discount,
            imageUrl,
          };
        });
      },
      this.CHAIN_NAME,
      section.category,
      validFrom,
      validTo
    );
  }

  private async extractValidityPeriod(page: Page) {
    const bubbleGroup = await page.$$(".k-smooth-scroll");
    const bubble = await bubbleGroup[2]?.$(
      ".k-bubble-group__list .k-navigation-bubble__label"
    );

    if (!bubble) return { validFrom: "", validTo: "" };

    const text = await bubble.evaluate((el) => (el.textContent || "").trim());
    const match = text.match(/(\d{2}\.\d{2}\.\d{4}) - (\d{2}\.\d{2}\.\d{4})/);

    if (!match) return { validFrom: "", validTo: "" };

    const [_, from, to] = match;
    if (!from || !to) return { validFrom: "", validTo: "" };

    const [d1, m1, y1] = from.split(".");
    const [d2, m2, y2] = to.split(".");

    const validFrom = new Date(`${y1}-${m1}-${d1}T00:00:00.000Z`).toISOString();
    const validTo = new Date(`${y2}-${m2}-${d2}T23:59:59.999Z`).toISOString();

    return {
      validFrom,
      validTo,
    };
  }

  private async extractCategorySections(page: Page) {
    const availableCategories = (await prisma.category.findMany()).map(
      (cat) => cat.name
    );
    const allSectionIds = await page.$$eval(".k-product-section", (sections) =>
      sections.map((section) => ({
        sectionId: section.id,
      }))
    );

    const input = JSON.stringify({ availableCategories, allSectionIds });
    const response = await gemini.models.generateContent({
      model: "gemini-2.0-flash",
      contents: input,
      config: {
        systemInstruction: getCategoryMatchWhithSectionPrompt(),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sectionId: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["sectionId", "category"],
          },
        },
        temperature: 0.2,
      },
    });

    const jsonResponse = response.text || "";
    const matchedCategoryLinks: IScrapedCategorySection[] =
      JSON.parse(jsonResponse);
    return matchedCategoryLinks;
  }

  async scrapeOffers(page: Page): Promise<IScrapableProduct[]> {
    const sections = await this.extractCategorySections(page);

    const { validFrom, validTo } = await this.extractValidityPeriod(page);

    const products = await Promise.all(
      sections.map(async (section) => {
        return this.extractSectionData(page, section, validFrom, validTo);
      })
    );
    return products.flat();
  }
}
