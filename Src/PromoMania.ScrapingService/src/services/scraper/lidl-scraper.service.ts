import type { Page } from "puppeteer";
import type {
  IScrapableProduct,
  IScraper,
} from "../../models/scraper.model.js";
import prisma from "../../config/prisma-client.config.js";
import type { IScrapedCategoryLink } from "../../models/scraped-category.model.js";
import gemini from "../../config/gemini/gemini-client.config.js";
import { Type } from "@google/genai";
import { getCategoryMatchWithPagePrompt } from "../../config/gemini/promts/systemInstructions.config.js";

export default class LidlScraperService implements IScraper {
  readonly CHAIN_NAME = "Lidl";

  private async extractCategoryLinks(
    page: Page
  ): Promise<IScrapedCategoryLink[]> {
    const availableCategories = (await prisma.category.findMany()).map(
      (cat) => cat.name
    );

    const pageLinks = await page.$$eval(
      "nav.n-header__main-navigation-wrapper ol.n-header__main-navigation--sub > li > a",
      (elements) =>
        elements
          .map((link) => ({
            pageTitle:
              link
                .querySelector("span.n-header__main-navigation-link-text")
                ?.textContent.trim()
                .toLowerCase() || "",
            url: link.href,
          }))
          .filter((link) => link.url.startsWith("https://www.lidl.bg/h"))
    );

    console.log("Page links found:", pageLinks);

    const input = JSON.stringify({ availableCategories, pageLinks });
    const response = await gemini.models.generateContent({
      model: "gemini-2.0-flash",
      contents: input,
      config: {
        systemInstruction: getCategoryMatchWithPagePrompt(),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              url: { type: Type.STRING },
            },
            required: ["name", "url"],
          },
        },
        temperature: 0.2,
      },
    });
    console.log("Gemini response: ", response.text);

    const matchedCategoryLinks: IScrapedCategoryLink[] = JSON.parse(
      response.text || ""
    );
    return matchedCategoryLinks;
  }

  private async scrapeCategoryPage(
    currentPage: Page,
    category: IScrapedCategoryLink
  ): Promise<IScrapableProduct[]> {
    const categoryPage = await currentPage.browser().newPage();

    await categoryPage.goto(category.url, {
      waitUntil: "networkidle2",
    });

    console.log(
      `➡️ Заредена категория: ${category.name} -> ${categoryPage.url()}`
    );

    await this.acceptCookies(categoryPage);
    await this.scrollToBottom(categoryPage);

    const products = await this.scrapeProductsFromCategory(
      categoryPage,
      category
    );
    console.log(`🛍️ ${category.name}: Намерени продукти: ${products.length}`);
    await categoryPage.close();
    return products;
  }

  private async scrapeProductsFromCategory(
    categoryPage: Page,
    category: IScrapedCategoryLink
  ): Promise<IScrapableProduct[]> {
    return await categoryPage.$$eval(
      ".s-page__results .product-grid-box",
      (products, categoryName, storeChainName) => {
        return products.map((el) => {
          const name =
            el
              .querySelector<HTMLDivElement>(".product-grid-box__title")
              ?.textContent.trim() || "";
          const unit =
            el
              .querySelector<HTMLDivElement>(".ods-price__footer:nth-child(2)")
              ?.textContent.trim() || "";
          const prices =
            el.querySelectorAll<HTMLDivElement>(".ods-price__value");
          const priceBgn = prices[0]?.textContent?.trim() || "";
          const priceEur = prices[1]?.textContent?.trim() || "";
          const oldPrices =
            el
              .querySelector<HTMLDivElement>(".ods-price__stroke-price s")
              ?.textContent.trim() || "";

          let oldPriceBgn = "";
          let oldPriceEur = "";
          const match = oldPrices.match(
            /([\d.,]+)\s*ЛВ\.\s*\(([\d.,]+)\s*€\)/i
          );
          if (match) {
            oldPriceBgn = match[1] || "";
            oldPriceEur = match[2] || "";
          }
          const availability =
            el
              .querySelector<HTMLSpanElement>(
                ".product-grid-box__availabilities .ods-badge__label"
              )
              ?.textContent.trim() || "";

          let validFrom = "";
          let validTo = "";

          if (availability != "") {
            const match = availability.match(
              /от\s+(\d{2}\.\d{2}\.)\s*-\s*(\d{2}\.\d{2}\.)/
            );
            if (match && match[1] && match[2]) {
              const currentYear = new Date().getFullYear();
              const from = match[1];
              const to = match[2];

              const [fromDay, fromMonth] = from.split(".");
              const [toDay, toMonth] = to.split(".");

              validFrom = new Date(
                currentYear,
                Number(fromMonth) - 1,
                Number(fromDay) + 1
              ).toISOString();

              validTo = new Date(
                currentYear,
                Number(toMonth) - 1,
                Number(toDay) + 1
              ).toISOString();
            }
          }

          const discount =
            el
              .querySelector<HTMLDivElement>(".ods-price__box-content-text-el")
              ?.textContent.trim() || "";
          const imageUrl =
            el.querySelector<HTMLImageElement>(".odsc-image-gallery__image")
              ?.src || "";

          return {
            chain: storeChainName,
            category: categoryName,
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
      category.name,
      this.CHAIN_NAME
    );
  }

  private async scrollToBottom(page: Page) {
    console.log("🌀 Scrolling page dynamically (until network idle)...");

    const SCROLL_STEP = await page.evaluate(() => window.innerHeight);
    const SCROLL_DELAY = 500; // колко време да чака между скролове
    const IDLE_TIMEOUT = 2000; // след колко ms без нови заявки спира
    let lastRequestTime = Date.now();

    // 👉 слушаме за всяка нова заявка, успешна или не
    const updateRequestTime = () => (lastRequestTime = Date.now());
    page.on("request", updateRequestTime);
    page.on("requestfinished", updateRequestTime);
    page.on("requestfailed", updateRequestTime);

    // 🌀 основен цикъл на скролиране
    while (true) {
      // скролирай надолу със стъпка от височината на екрана
      await page.evaluate((step) => window.scrollBy(0, step), SCROLL_STEP);
      await new Promise((r) => setTimeout(r, SCROLL_DELAY));

      // провери дали е минало IDLE_TIMEOUT време без нова заявка
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;

      if (timeSinceLastRequest > IDLE_TIMEOUT) {
        console.log(`✅ No new requests detected — end of page reached.`);
        break;
      }
    }
  }

  private async acceptCookies(page: Page): Promise<void> {
    try {
      // Изчакваме банера на OneTrust да се появи (до 10 секунди)
      await page
        .waitForSelector("#onetrust-banner-sdk", {
          visible: true,
          timeout: 10000, // 10 секунди
        })
        .catch(() => null);

      const banner = await page.$("#onetrust-banner-sdk");
      if (!banner) {
        console.log("✅ Няма popup за бисквитки — продължаваме");
        return;
      }

      console.log("🍪 Открит е Lidl popup за бисквитки — приемаме...");

      // Натискаме бутона „ПРИЕМАНЕ“
      const acceptBtn = await page.$("#onetrust-accept-btn-handler");
      if (acceptBtn) {
        await acceptBtn.click();

        // Изчакваме банерът да се скрие напълно
        await page.waitForSelector("#onetrust-banner-sdk", {
          hidden: true,
          timeout: 5000,
        });

        console.log("✅ Popup за бисквитки е приет успешно.");
      } else {
        console.warn(
          "⚠️ Бутонът 'ПРИЕМАНЕ' не беше намерен — продължаваме без натискане."
        );
      }
    } catch (err) {
      console.warn("⚠️ Грешка при приемане на бисквитки:", err);
    }
  }

  async scrapeOffers(page: Page): Promise<IScrapableProduct[]> {
    const categories = await this.extractCategoryLinks(page);

    const productsArrays = await Promise.all(
      categories.map(async (cat) => {
        return this.scrapeCategoryPage(page, cat);
      })
    );

    return productsArrays.flat();
  }
}
