import ProductRepository from "../repository/product.repository.js";
import ShoppingCartRepository from "../repository/shopping-cart.repository.js";
import UserRepository from "../repository/user.repository.js";
import type {
  ShoppingCartDto,
  ShoppingCartItemDto,
} from "../models/shopping-cart.dto.js";

export default class ShoppingCartService {
  private readonly shoppingCartRepository: ShoppingCartRepository;
  private readonly userRepository: UserRepository;
  private readonly productRepository: ProductRepository;

  constructor() {
    this.shoppingCartRepository = new ShoppingCartRepository();
    this.userRepository = new UserRepository();
    this.productRepository = new ProductRepository();
  }

  async getShoppingCartByPublicUserId(
    publicUserId: string
  ): Promise<ShoppingCartDto | null> {
    const user = await this.userRepository.getByPublicId(publicUserId);
    if (!user) return null;

    const rows = await this.shoppingCartRepository.getDetailsByUserId(user.id);
    const cart = rows[0]?.cart;
    if (!cart) return null;

    // Get all unique product IDs from cart items
    const productIds = Array.from(
      new Set(
        rows
          .filter((row) => row.item && row.product?.publicId)
          .map((row) => row.product?.publicId)
          .filter((id): id is string => id !== undefined)
      )
    );

    // Batch fetch all product prices in one query
    const productPrices = await this.productRepository.getBatchedLowestPrices(
      productIds
    );

    // Create a map for quick lookup
    const priceMap = new Map(productPrices.map((p) => [p.publicId, p]));

    // Map cart items with their products and prices
    const items: ShoppingCartItemDto[] = rows
      .filter(
        (
          row
        ): row is typeof row & {
          item: NonNullable<(typeof row)["item"]>;
          product: NonNullable<(typeof row)["product"]>;
        } => Boolean(row.item && row.product)
      )
      .map((row) => {
        const enrichedProduct = priceMap.get(row.product.publicId) || {
          ...row.product,
          priceBgn: null,
          priceEur: null,
          discount: null,
        };
        return {
          publicId: row.item.publicId,
          quantity: row.item.quantity,
          product: {
            publicId: enrichedProduct.publicId,
            name: enrichedProduct.name,
            brand: enrichedProduct.brand,
            barcode: enrichedProduct.barcode,
            imageUrl: enrichedProduct.imageUrl,
            unit: enrichedProduct.unit,
            priceBgn: enrichedProduct.priceBgn ?? null,
            priceEur: enrichedProduct.priceEur ?? null,
            discount: enrichedProduct.discount ?? null,
          },
        };
      });

    return {
      publicId: cart.publicId,
      createdAt: cart.createdAt,
      items,
    };
  }
}
