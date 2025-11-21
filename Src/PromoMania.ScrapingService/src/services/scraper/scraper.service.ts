import { getBrowser } from "../../config/puppeteer.config.js";
import prisma from "../../config/prisma-client.config.js";
import ScraperFactory from "./scraper.factory.js";

export default class ScraperService {
  async scrapeAllSites() {
    const browser = await getBrowser(); // In order tmarket scraper to work headless needs to be false - idk why lol
    try {
      const storeChains = await prisma.storeChain.findMany();

      const results = await Promise.all(
        storeChains.map(async (chain) => {
          const page = await browser.newPage();
          const url = `${chain.base_url}${chain.products_page}`;

          try {
            await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

            const scraper = ScraperFactory.getScraper(chain.name);
            const products = await scraper.scrapeOffers(page);

            return products;
          } catch (err) {
            console.error(
              `⚠️ Error occurred when scraping ${chain.name}: `,
              err
            );

            return null;
          } finally {
            await page.close();
          }
        })
      );

      return results.flat().filter((r) => r !== null);
    } finally {
      await browser.close();
    }
  }
}
