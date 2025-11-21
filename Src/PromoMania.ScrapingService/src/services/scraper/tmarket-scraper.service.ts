import type { Page } from "puppeteer";
import type {
  IScrapableProduct,
  IScraper,
} from "../../models/scraper.model.js";
import prisma from "../../config/prisma-client.config.js";
import type { IScrapedCategoryLink } from "../../models/scraped-category.model.js";
import { getCategoryMatchWithPagePrompt } from "../../config/gemini/promts/systemInstructions.config.js";
import gemini from "../../config/gemini/gemini-client.config.js";
import { Type } from "@google/genai";

export default class TMarketScraperService implements IScraper {
  readonly CHAIN_NAME = "TMarket";

  private async extractCategoryLinks(
    page: Page
  ): Promise<IScrapedCategoryLink[]> {
    const availableCategories = (await prisma.category.findMany()).map(
      (cat) => cat.name
    );

    const pageLinks = await page.$$eval(
      "._nav-mobile ._navigation-dropdown-level-1 > ul > li._navigation-dropdown-list-item.item-collapse > a",
      (elements) =>
        elements.map((link) => ({
          pageTitle:
            link
              .querySelector("span._figure-stack-label")
              ?.textContent.trim()
              .toLowerCase() || "",
          url: link.href,
        }))
    );

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
    const jsonResponse = response.text || "";
    const matchedCategoryLinks: IScrapedCategoryLink[] =
      JSON.parse(jsonResponse);
    return matchedCategoryLinks;
  }

  private async scrapeCategoryPage(
    currentPage: Page,
    category: IScrapedCategoryLink
  ): Promise<IScrapableProduct[]> {
    const categoryPage = await currentPage.browser().newPage();

    await categoryPage.goto(category.url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await this.acceptCookies(categoryPage);
    await this.scrollToBottom(categoryPage);

    const products = await this.scrapeProductsFromCategory(
      categoryPage,
      category
    );
    await categoryPage.close();
    return products;
  }

  private async scrapeProductsFromCategory(
    categoryPage: Page,
    category: IScrapedCategoryLink
  ): Promise<IScrapableProduct[]> {
    return categoryPage.$$eval(
      "._products-list ._product",
      (products, categoryName, storeChainName) => {
        return products.map((el) => {
          const name =
            el.querySelector("._product-name-tag a")?.textContent.trim() || "";

          const unit =
            el
              .querySelector("._product-unit-text ._button_unit")
              ?.textContent?.trim() || "";

          // Текущи цени (лв. и €)
          const priceBgn =
            el
              .querySelector("._product-price-inner .bgn2eur-primary-currency")
              ?.textContent?.trim() || "";

          const priceEur =
            el
              .querySelector(
                "._product-price-inner .bgn2eur-secondary-currency"
              )
              ?.textContent?.trim() || "";

          // Стари цени (лв. и €) – взимаме от <del>
          const oldPriceBgn =
            el
              .querySelector("._product-price-old .bgn2eur-primary-currency")
              ?.textContent?.trim() || "";

          const oldPriceEur =
            el
              .querySelector("._product-price-old .bgn2eur-secondary-currency")
              ?.textContent?.trim() || "";

          // Отстъпка
          const discount =
            el
              .querySelector<HTMLSpanElement>("._product-details-discount")
              ?.textContent?.trim() || "";

          // Валидност – от countdown (атрибут data-end-date)
          const countdownEl = el.querySelector<HTMLDivElement>(
            "._countdown.js-countdown"
          );
          const validFrom = new Date().toISOString();
          let validTo = "";

          if (countdownEl) {
            const endDate = countdownEl.getAttribute("data-end-date");
            if (endDate) {
              validTo = new Date(endDate).toISOString();
            }
          }

          // Снимка
          const imageUrl =
            el.querySelector<HTMLImageElement>("._product-image img")?.src ||
            "";

          return {
            chain: storeChainName,
            category: categoryName,
            name,
            unit,
            priceBgn,
            priceEur,
            oldPriceBgn,
            oldPriceEur,
            discount,
            validFrom,
            validTo,
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
        console.log("✅ No new requests detected — end of page reached.");
        break;
      }
    }

    // 🧹 важно — махаме слушателите, за да не изтича памет
    page.off("request", updateRequestTime);
    page.off("requestfinished", updateRequestTime);
    page.off("requestfailed", updateRequestTime);
  }

  private async acceptCookies(page: Page): Promise<void> {
    try {
      // Изчакваме popup-а да се появи (до 10 секунди)
      await page
        .waitForSelector("#gdpr_popup", {
          visible: true,
          timeout: 10000, // 10 секунди
        })
        .catch(() => null); // Ако не се появи — просто продължаваме

      const popup = await page.$("#gdpr_popup");
      if (!popup) {
        console.log("✅ Няма popup за бисквитки — продължаваме");
        return;
      }

      console.log("🍪 Открит е popup за бисквитки — приемаме...");

      // Натиска бутона „Запознат съм и се съгласявам“
      const acceptBtn = await page.$(".js-cookies-accept");
      if (acceptBtn) {
        await acceptBtn.click();

        // Изчаква да се затвори модалът напълно
        await page.waitForSelector("#gdpr_popup", {
          hidden: true,
          timeout: 5000,
        });
        console.log("✅ Popup за бисквитки е приет успешно.");
      } else {
        console.warn("⚠️ Бутонът за съгласие не беше намерен.");
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
