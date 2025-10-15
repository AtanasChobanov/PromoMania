import type { Product } from "./product.model.js";

export type ProductSectionName =
  | "top"
  | "our-choice"
  | "kaufland"
  | "lidl"
  | "billa"
  | "tmarket";

export enum ProductSectionTitle {
  CHEAPEST_PRODUCTS = "Топ продукти",
  BIGGEST_DISCOUNTS = "Нашият избор",
  KAUFLAND_OFFERS = "Kaufland оферти",
  LIDL_OFFERS = "Lidl оферти",
  BILLA_OFFERS = "Billa оферти",
  TMARKET_OFFERS = "T Market оферти",
}

export default class ProductSection {
  title: ProductSectionTitle;
  products: Product[];

  constructor(title: ProductSectionTitle, products: Product[]) {
    this.title = title;
    this.products = products;
  }
}
