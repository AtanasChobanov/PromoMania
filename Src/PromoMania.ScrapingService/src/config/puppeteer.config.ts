import puppeteer from "puppeteer";

export async function getBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
  });
  return browser;
}
