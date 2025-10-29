import ProductRepository from "../repository/product.repository.js";
import ShoppingCartItemRepository from "../repository/shopping-cart-item.repository.js";
import ShoppingCartRepository from "../repository/shopping-cart.repository.js";
import UserRepository from "../repository/user.repository.js";

export default class ShoppingCartItemService {
  private readonly shoppingCartRepository: ShoppingCartRepository;
  private readonly shoppingCartItemRepository: ShoppingCartItemRepository;
  private readonly userRepository: UserRepository;
  private readonly productRepository: ProductRepository;

  constructor() {
    this.shoppingCartRepository = new ShoppingCartRepository();
    this.userRepository = new UserRepository();
    this.productRepository = new ProductRepository();
    this.shoppingCartItemRepository = new ShoppingCartItemRepository();
  }

  async addItemToShoppingCart(
    publicUserId: string,
    publicProductId: string,
    quantity: number = 1
  ) {
    const user = await this.userRepository.getByPublicId(publicUserId);
    const product = await this.productRepository.getByPublicId(publicProductId);

    if (!user || !product) {
      throw new Error("User or product not found");
    }

    const cart = await this.shoppingCartRepository.getByUserId(user.id);
    if (!cart) {
      throw new Error("Shopping cart not found");
    }

    // Check if item already exists in cart
    const existingItem =
      await this.shoppingCartItemRepository.findCartItemByProductId(
        cart.id,
        product.id
      );

    if (existingItem) {
      // If item exists, update its quantity
      return await this.shoppingCartItemRepository.updateItemQuantity(
        existingItem.publicId,
        existingItem.quantity + quantity
      );
    } else {
      // If item doesn't exist, create new one
      return await this.shoppingCartItemRepository.addItemToCart(
        cart.id,
        product.id,
        quantity
      );
    }
  }

  async updateItemQuantity(publicItemId: string, quantity: number) {
    const item = await this.shoppingCartItemRepository.findItemByPublicId(
      publicItemId
    );
    if (!item) {
      throw new Error("Cart item not found");
    }

    const editedItem =
      (await this.shoppingCartItemRepository.updateItemQuantity(
        publicItemId,
        quantity
      ))!;
    return editedItem;
  }
}
