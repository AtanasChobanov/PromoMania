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
