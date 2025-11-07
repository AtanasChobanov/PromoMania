import PriceRepository from "../repository/price.repository.js";
import ShoppingCartService from "../services/shopping-cart.service.js";
import ProductRepository from "../repository/product.repository.js";
import type {
  ShoppingCartDto,
  ShoppingCartItemDto,
  StorePrices,
  StoreProductPrice,
} from "../models/shopping-cart.dto.js";
import { StoreChainName } from "../models/store-chain.model.js";

export default class StoreSuggestionService {
  private readonly priceRepository: PriceRepository;
  private readonly shoppingCartService: ShoppingCartService;
  private readonly productRepository: ProductRepository;
  // Exchange rate BGN -> EUR. Use environment variable in production for configurability.
  // If the env var is missing or invalid, fall back to the canonical rate 1.9558.
  static readonly BGN_TO_EUR_RATE =
    process.env.BGN_TO_EUR_RATE && Number(process.env.BGN_TO_EUR_RATE) > 0
      ? Number(process.env.BGN_TO_EUR_RATE)
      : 1.9558;

  constructor() {
    this.priceRepository = new PriceRepository();
    this.shoppingCartService = new ShoppingCartService();
    this.productRepository = new ProductRepository();
  }

  async suggestCheapestStoreOption(publicUserId: string) {
    const cartProducts = await this.getCartItemsWithAllPrices(publicUserId);
    if (!cartProducts) return null;

    const storeOptions = await this.calculateLowestPricesPerStore(
      cartProducts.items
    );

    const { bestOffer, otherOffers } = this.selectBestOffer(storeOptions);
    return { bestOffer, otherOffers };
  }

  private selectBestOffer(storeOptions: StorePrices[]) {
    if (storeOptions.length === 0) {
      return {
        bestOffer: null as StorePrices | null,
        otherOffers: [] as StorePrices[],
      };
    }

    // Make a shallow copy and sort by totalPriceBgn ascending
    const sortedOffers = [...storeOptions].sort(
      (a, b) => a.totalPriceBgn - b.totalPriceBgn
    );
    const bestOffer = sortedOffers[0];
    const otherOffers = sortedOffers.slice(1);
    return { bestOffer, otherOffers };
  }

  private async calculateLowestPricesPerStore(
    cartItems: ShoppingCartItemDto[]
  ): Promise<StorePrices[]> {
    const currentDate = new Date();

    // Process each store chain concurrently using Promise.all
    const storePromises = Object.values(StoreChainName).map(
      async (storeChain) => {
        const products: StoreProductPrice[] = [];
        let totalPriceBgn = 0;
        let totalPriceEur = 0;

        // For each cart item, find the lowest valid price in this store
        for (const item of cartItems) {
          // Filter prices for current store and check validity
          const validPrices = item.product.prices.filter((price) => {
            if (!price.storeChain?.name || !price.validFrom) return false;

            const isCurrentStore = price.storeChain.name === storeChain;
            const isValidNow =
              new Date(price.validFrom) <= currentDate &&
              (!price.validTo || new Date(price.validTo) >= currentDate);

            return isCurrentStore && isValidNow;
          });

          if (validPrices.length === 0) continue;

          // Find the lowest price among valid prices
          const lowestPrice = validPrices.reduce((lowest, current) => {
            if (!lowest) return current;

            // For regular prices (no discount), or comparing same type of prices
            if (
              (!lowest.discount && !current.discount) ||
              (lowest.discount && current.discount)
            ) {
              return (current.priceBgn ?? Infinity) <
                (lowest.priceBgn ?? Infinity)
                ? current
                : lowest;
            }
            // Prefer discounted prices over regular ones
            return current.discount ? current : lowest;
          });

          // If we found a valid price for this product in this store
          if (
            lowestPrice &&
            (lowestPrice.priceBgn !== null || lowestPrice.priceEur !== null)
          ) {
            const productPrice: StoreProductPrice = {
              productPublicId: item.product.publicId,
              quantity: item.quantity,
              priceBgn: lowestPrice.priceBgn ?? 0,
              priceEur: lowestPrice.priceEur ?? 0,
            };

            products.push(productPrice);
            // Add to total and round to 2 decimal places
            totalPriceBgn =
              Math.round(
                (totalPriceBgn + (lowestPrice.priceBgn ?? 0) * item.quantity) *
                  100
              ) / 100;
          }
        }

        // Derive EUR total from BGN total using the configured exchange rate.
        // Use a sane fallback if the configured rate is invalid or zero.
        totalPriceEur =
          Math.round(
            (totalPriceBgn / StoreSuggestionService.BGN_TO_EUR_RATE) * 100
          ) / 100;

        return {
          storeChain,
          products,
          totalPriceBgn,
          totalPriceEur,
        };
      }
    );

    // Wait for all store calculations to complete
    const allStorePrices = await Promise.all(storePromises);

    // Filter out undefined results and stores that don't have prices for any products
    return allStorePrices.filter(
      (store) => store.products.length === cartItems.length
    );
  }

  private async getCartItemsWithAllPrices(
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
