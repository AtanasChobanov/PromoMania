import { ShoppingCartRepository } from "../repository/shopping-cart.repository.js";
import { UserRepository } from "../repository/user.repository.js";

export default class ShoppingCartService {
  private readonly shoppingCartRepository: ShoppingCartRepository;
  private readonly userRepository: UserRepository;

  constructor() {
    this.shoppingCartRepository = new ShoppingCartRepository();
    this.userRepository = new UserRepository();
  }

  async getShoppingCartByPublicUserId(publicUserId: string | undefined) {
    if (!publicUserId) return null;

    const user = await this.userRepository.findByPublicId(publicUserId);
    if (!user) return null;

    const rows = await this.shoppingCartRepository.findByUserId(user.id);

    if (!rows.length) return null;
    const cart = rows[0]?.ShoppingCart;
    const items = rows
      .filter((r) => r.ShoppingCartItem) // изключваме празните редове
      .map((r) => ({
        id: r.ShoppingCartItem?.id,
        quantity: r.ShoppingCartItem?.quantity,
        product: r.Product,
      }));

    return {
      ...cart,
      items,
    };
  }
}
