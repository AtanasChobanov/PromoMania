import PriceRepository from "../repository/price.repository.js";
import ShoppingCartService from "../services/shopping-cart.service.js";
import ProductRepository from "../repository/product.repository.js";
import type { ShoppingCartDto } from "../models/shopping-cart.dto.js";

export default class StoreSuggestionService {
  private readonly priceRepository: PriceRepository;
  private readonly shoppingCartService: ShoppingCartService;
  private readonly productRepository: ProductRepository;

  constructor() {
    this.priceRepository = new PriceRepository();
    this.shoppingCartService = new ShoppingCartService();
    this.productRepository = new ProductRepository();
  }

  async getCartItemsWithAllPrices(
    publicUserId: string
  ): Promise<ShoppingCartDto | null> {
    // Get the cart using existing service
    const cart = await this.shoppingCartService.getShoppingCartByPublicUserId(
      publicUserId
    );
    if (!cart) return null;

    // Get all product IDs
    const productIds = await Promise.all(
      cart.items.map(async (item) => {
        const product = await this.productRepository.getByPublicId(
          item.product.publicId
        );
        return product?.id;
      })
    );

    // Filter out any nulls and get all prices
    const validProductIds = productIds.filter(
      (id): id is number => id !== undefined
    );
    const allPrices = await this.priceRepository.getAllPricesForProducts(
      validProductIds
    );

    // Group prices by product
    const pricesByProduct = new Map<string, typeof allPrices>();
    allPrices.forEach((price) => {
      if (!price.productPublicId) return;
      const prices = pricesByProduct.get(price.productPublicId) || [];
      prices.push(price);
      pricesByProduct.set(price.productPublicId, prices);
    });

    // Map the cart items with all their prices and filter out items without valid prices
    const enrichedItems = cart.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        prices: (pricesByProduct.get(item.product.publicId) || []).map(
          (price) => ({
            priceBgn: Number(price.priceBgn),
            priceEur: Number(price.priceEur),
            discount: price.discount,
            validFrom: new Date(price.validFrom),
            validTo: price.validTo ? new Date(price.validTo) : null,
            storeChain: price.storeChain || { publicId: "", name: "" },
          })
        ),
      },
    }));

    // Filter out items that have no valid prices (neither BGN nor EUR)
    const filteredItems = enrichedItems.filter((item) =>
      item.product.prices.some(
        (price) => !isNaN(price.priceBgn) || !isNaN(price.priceEur)
      )
    );

    return {
      ...cart,
      items: filteredItems,
    };
  }
}
