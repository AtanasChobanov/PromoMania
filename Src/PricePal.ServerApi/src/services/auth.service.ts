import { type RegisterDto } from "../models/register.dto.js";
import UserRepository from "../repository/user.repository.js";
import HashHelper from "../utils/hash.helper.js";
import JwtHelper from "../utils/jwt.helper.js";

export default class AuthService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(dto: RegisterDto) {
    const existingEmail = await this.userRepository.findUserByEmail(dto.email);
    if (existingEmail) {
      const err: any = new Error("Email already in use");
      err.status = 409;
      throw err;
    }

    const passwordHash = await HashHelper.hashPassword(dto.password);

    const createdUser = await this.userRepository.createUser({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });
    if (!createdUser) {
      throw new Error("Failed to create user");
    }

    const accessToken = JwtHelper.signAccessToken(createdUser);
    return {
      user: createdUser,
      accessToken,
    };
  }
}
