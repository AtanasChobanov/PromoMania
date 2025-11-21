import ProductRepository from "../repository/product.repository.js";
import type { ProductOverviewDto } from "./product.dto.js";
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
  products: ProductOverviewDto[];
  pagination: { offset: number; limit: number; hasMore: boolean };

  constructor(
    title: ProductSectionTitle,
    products: ProductOverviewDto[],
    pagination: { offset?: number; limit?: number; hasMore: boolean }
  ) {
    this.title = title;
    this.products = products;
    this.pagination = {
      offset: pagination.offset || ProductRepository.DEFAULT_OFFSET,
      limit: pagination.limit || ProductRepository.DEFAULT_LIMIT,
      hasMore: pagination.hasMore,
    };
  }
}
