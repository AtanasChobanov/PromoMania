import ProductSection, {
  ProductSectionTitle,
  type ProductSectionName,
} from "../models/product-section.model.js";
import type { ProductOverviewDto } from "../models/product.dto.js";
import { StoreChainName } from "../models/store-chain.model.js";
import PriceRepository from "../repository/price.repository.js";
import ProductRepository from "../repository/product.repository.js";

export default class ProductService {
  private readonly priceRepository: PriceRepository;
  private readonly productRepository: ProductRepository;
  private readonly productHandlers: Record<
    ProductSectionName,
    (pagination?: {
      offset?: number;
      limit?: number;
    }) => Promise<ProductSection>
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

  private async getCheapestProducts(pagination?: {
    offset?: number;
    limit?: number;
  }): Promise<ProductSection> {
    const priceIds = await this.priceRepository.getLowestPricePerProduct();

    let productData: ProductOverviewDto[] = (
      await this.productRepository.getOrderedByPrice(priceIds, pagination)
    ).map((product) => {
      return {
        ...product,
        priceBgn: product.priceBgn ? Number(product.priceBgn) : null,
        priceEur: product.priceEur ? Number(product.priceEur) : null,
      };
    });

    const hasMore =
      productData.length >
      (pagination?.limit || ProductRepository.DEFAULT_LIMIT);

    productData = productData.slice(
      0,
      pagination?.limit || ProductRepository.DEFAULT_LIMIT
    );

    return new ProductSection(
      ProductSectionTitle.CHEAPEST_PRODUCTS,
      productData,
      { ...pagination, hasMore }
    );
  }

  private async getBiggestDiscounts(pagination?: {
    offset?: number;
    limit?: number;
  }): Promise<ProductSection> {
    let priceIds = await this.priceRepository.getBiggestDiscountPerProduct();

    priceIds = Array.from(
      priceIds
        .reduce((map, p) => {
          const existing = map.get(p.productId);
          const currentDiscount = p.discount ?? 0;
          const existingDiscount = existing?.discount ?? 0;

          if (!existing || currentDiscount > existingDiscount) {
            map.set(p.productId, p);
          }
          return map;
        }, new Map())
        .values()
    );

    let productData: ProductOverviewDto[] = (
      await this.productRepository.getOrderedByDiscount(priceIds, pagination)
    ).map((product) => {
      return {
        ...product,
        priceBgn: product.priceBgn ? Number(product.priceBgn) : null,
        priceEur: product.priceEur ? Number(product.priceEur) : null,
      };
    });

    const hasMore =
      productData.length >
      (pagination?.limit || ProductRepository.DEFAULT_LIMIT);

    productData = productData.slice(
      0,
      pagination?.limit || ProductRepository.DEFAULT_LIMIT
    );

    return new ProductSection(
      ProductSectionTitle.BIGGEST_DISCOUNTS,
      productData,
      { ...pagination, hasMore }
    );
  }

  private createStoreOffersFetcher(
    chain: StoreChainName,
    sectionTitle: ProductSectionTitle
  ): (pagination?: {
    offset?: number;
    limit?: number;
  }) => Promise<ProductSection> {
    return async (pagination?: {
      offset?: number;
      limit?: number;
    }): Promise<ProductSection> => {
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

      let productData: ProductOverviewDto[] = (
        await this.productRepository.getOrderedByDiscount(priceIds, pagination)
      ).map((product) => {
        return {
          ...product,
          priceBgn: product.priceBgn ? Number(product.priceBgn) : null,
          priceEur: product.priceEur ? Number(product.priceEur) : null,
        };
      });

      const hasMore =
        productData.length >
        (pagination?.limit || ProductRepository.DEFAULT_LIMIT);

      productData = productData.slice(
        0,
        pagination?.limit || ProductRepository.DEFAULT_LIMIT
      );

      return new ProductSection(sectionTitle, productData, {
        ...pagination,
        hasMore,
      });
    };
  }

  async getProductsOverview(
    sectionType: ProductSectionName,
    pagination?: { offset?: number; limit?: number }
  ): Promise<ProductSection> {
    const handler = this.productHandlers[sectionType];
    return await handler(pagination);
  }

  async getProductDetailsByPublicId(publicProductId: string) {
    const rows = await this.productRepository.getDetailsByPublicId(
      publicProductId
    );
    const product = rows[0];
    if (!product?.product) {
      return null;
    }

    const prices = rows.map((r) => ({
      ...r.price,
      priceBgn: r.price?.priceBgn ? Number(r.price.priceBgn) : null,
      priceEur: r.price?.priceEur ? Number(r.price.priceEur) : null,
      storeChain: r.storeChain,
    }));

    return {
      ...product.product,
      category: product.category,
      prices,
    };
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
