import ProductSection, {
  ProductSectionTitle,
} from "../models/product-section.model.js";
import type { Product } from "../models/product.model.js";
import PriceRepository from "../repository/price.repository.js";
import ProductRepository from "../repository/product.repository.js";

export default class ProductService {
  private priceRepository: PriceRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.priceRepository = new PriceRepository();
    this.productRepository = new ProductRepository();
  }

  private async getCheapestProducts(): Promise<ProductSection> {
    const priceIds = await this.priceRepository.getLowestPricePerProduct();

    const productData: Product[] =
      await this.productRepository.getOrderedByPrice(priceIds);

    return new ProductSection(
      ProductSectionTitle.CHEAPEST_PRODUCTS,
      productData
    );
  }

  private async getBiggestDiscounts(): Promise<ProductSection> {
    let priceIds = await this.priceRepository.getBiggestDiscountPerProduct();

    priceIds = Array.from(
      priceIds
        .reduce((map, p) => {
          const existing = map.get(p.productId);
          const currentDiscount = p.discount ?? 0;
          const existingDiscount = existing?.discount ?? 0;

          if (!existing || currentDiscount < existingDiscount) {
            map.set(p.productId, p);
          }
          return map;
        }, new Map())
        .values()
    );

    const productData: Product[] =
      await this.productRepository.getOrderedByDiscount(priceIds);

    return new ProductSection(
      ProductSectionTitle.BIGGEST_DISCOUNTS,
      productData
    );
  }

  async getProductsOverview(): Promise<ProductSection[]> {
    const productsList: ProductSection[] = [];
    productsList.push(await this.getCheapestProducts());
    productsList.push(await this.getBiggestDiscounts());
    return productsList;
  }
}
