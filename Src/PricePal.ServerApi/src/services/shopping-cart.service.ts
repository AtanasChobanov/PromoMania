import ProductRepository from "../repository/product.repository.js";
import ShoppingCartRepository from "../repository/shopping-cart.repository.js";
import UserRepository from "../repository/user.repository.js";

export default class ShoppingCartService {
  private readonly shoppingCartRepository: ShoppingCartRepository;
  private readonly userRepository: UserRepository;
  private readonly productRepository: ProductRepository;

  constructor() {
    this.shoppingCartRepository = new ShoppingCartRepository();
    this.userRepository = new UserRepository();
    this.productRepository = new ProductRepository();
  }

  async getShoppingCartByPublicUserId(publicUserId: string) {
    const user = await this.userRepository.findByPublicId(publicUserId);
    if (!user) return null;

    const rows = await this.shoppingCartRepository.findByUserId(user.id);
    const cart = rows[0]?.cart;
    if (!cart) return null;

    const items = rows
      .filter((row) => row.item) // изключваме празните редове
      .map((row) => ({
        ...row.item,
        product: row.product,
      }));

    return {
      ...cart,
      items,
    };
  }

  async addItemToShoppingCart(
    publicUserId: string,
    publicProductId: string,
    quantity: number = 1
  ) {
    const user = await this.userRepository.findByPublicId(publicUserId);
    const product = await this.productRepository.getByPublicId(publicProductId);

    if (!user || !product) {
      throw new Error("User or product not found");
    }

    const cart = await this.shoppingCartRepository.findCartByUserId(user.id);
    if (!cart) {
      throw new Error("Shopping cart not found");
    }

    // Check if item already exists in cart
    const existingItem =
      await this.shoppingCartRepository.findCartItemByProductId(
        cart.id,
        product.id
      );

    if (existingItem) {
      // If item exists, update its quantity
      return await this.shoppingCartRepository.updateItemQuantity(
        existingItem.publicId,
        existingItem.quantity + quantity
      );
    } else {
      // If item doesn't exist, create new one
      return await this.shoppingCartRepository.addItemToCart(
        cart.id,
        product.id,
        quantity
      );
    }
  }

  async updateCartItemQuantity(publicItemId: string, quantity: number) {
    const item = await this.shoppingCartRepository.findItemByPublicId(
      publicItemId
    );
    if (!item) {
      throw new Error("Cart item not found");
    }

    const editedItem = (await this.shoppingCartRepository.updateItemQuantity(
      publicItemId,
      quantity
    ))!;
    return editedItem;
  }
}
