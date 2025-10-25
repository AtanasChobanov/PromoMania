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

  async getShoppingCartByPublicUserId(publicUserId: string | undefined) {
    if (!publicUserId) return null;

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
    const product = await this.productRepository.findByPublicId(
      publicProductId
    );
    if (user && product) {
      const cart = await this.shoppingCartRepository.findCartByUserId(user.id);
      if (cart) {
        await this.shoppingCartRepository.addItemToCart(
          cart.id,
          product.id,
          quantity
        );
      }
    }
  }
}
