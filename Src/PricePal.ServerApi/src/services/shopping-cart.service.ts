import ProductRepository from "../repository/product.repository.js";
import ShoppingCartRepository from "../repository/shopping-cart.repository.js";
import UserRepository from "../repository/user.repository.js";

export default class ShoppingCartService {
  private readonly shoppingCartRepository: ShoppingCartRepository;
  private readonly userRepository: UserRepository;

  constructor() {
    this.shoppingCartRepository = new ShoppingCartRepository();
    this.userRepository = new UserRepository();
  }

  async getShoppingCartByPublicUserId(publicUserId: string) {
    const user = await this.userRepository.getByPublicId(publicUserId);
    if (!user) return null;

    const rows = await this.shoppingCartRepository.getDetailsByUserId(user.id);
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
}
