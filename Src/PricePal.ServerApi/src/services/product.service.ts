import ProductSection, {
  ProductSectionTitle,
  type ProductSectionName,
} from "../models/product-section.model.js";
import type { Product } from "../models/product.model.js";
import { StoreChainName } from "../models/store-chain.model.js";
import PriceRepository from "../repository/price.repository.js";
import ProductRepository from "../repository/product.repository.js";

export default class ProductService {
  private readonly priceRepository: PriceRepository;
  private readonly productRepository: ProductRepository;
  private readonly productHandlers: Record<
    ProductSectionName,
    () => Promise<ProductSection>
  >;

  constructor() {
    this.priceRepository = new PriceRepository();
    this.productRepository = new ProductRepository();
    this.productHandlers = {
      top: this.getCheapestProducts.bind(this),
      "our-choice": this.getBiggestDiscounts.bind(this),
      kaufland: this.createStoreOffersFetcher(
        StoreChainName.KAUFLAND,
        ProductSectionTitle.KAUFLAND_OFFERS
      ),
      lidl: this.createStoreOffersFetcher(
        StoreChainName.LIDL,
        ProductSectionTitle.LIDL_OFFERS
      ),
      billa: this.createStoreOffersFetcher(
        StoreChainName.BILLA,
        ProductSectionTitle.BILLA_OFFERS
      ),
      tmarket: this.createStoreOffersFetcher(
        StoreChainName.TMARKET,
        ProductSectionTitle.TMARKET_OFFERS
      ),
    };
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

  private createStoreOffersFetcher(
    chain: StoreChainName,
    sectionTitle: ProductSectionTitle
  ): () => Promise<ProductSection> {
    return async (): Promise<ProductSection> => {
      let priceIds =
        await this.priceRepository.getBiggestDiscountPerProductByStoreChain(
          chain
        );

      priceIds = Array.from(
        priceIds
          .reduce((map, p) => {
            const existing = map.get(p.productId);

            if (!existing) {
              map.set(p.productId, p);
            }
            return map;
          }, new Map())
          .values()
      );

      const productData: Product[] =
        await this.productRepository.getOrderedByDiscount(priceIds);

      return new ProductSection(sectionTitle, productData);
    };
  }

  async getProductsOverview(
    sectionType: ProductSectionName
  ): Promise<ProductSection> {
    const handler = this.productHandlers[sectionType];
    return await handler();
  }

  static isProductSectionName(value: string): value is ProductSectionName {
    return [
      "top",
      "our-choice",
      "kaufland",
      "lidl",
      "billa",
      "tmarket",
    ].includes(value);
  }
}
