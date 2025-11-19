import type { LoginDto } from "../models/login.dto.js";
import { type RegisterDto } from "../models/register.dto.js";
import UserRepository from "../repository/user.repository.js";
import HashHelper from "../utils/hash.helper.js";
import JwtHelper from "../utils/jwt.helper.js";

export default class AuthService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterDto) {
    const existingEmail = await this.userRepository.findUserByEmail(data.email);
    if (existingEmail) {
      const err: any = new Error("Email already in use");
      err.status = 409;
      throw err;
    }

    const passwordHash = await HashHelper.hashPassword(data.password);

    const createdUser = await this.userRepository.createUser({
      email: data.email,
      name: data.name,
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

  async login(data: LoginDto) {
    const existingEmail = await this.userRepository.findUserByEmail(data.email);

    if (!existingEmail) {
      const err: any = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }

    const isValid = await HashHelper.comparePassword(
      data.password,
      existingEmail.passwordHash
    );

    if (!isValid) {
      const err: any = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }

    const payload = {
      publicId: existingEmail.publicId,
      email: existingEmail.email,
      name: existingEmail.name,
    };

    const accessToken = JwtHelper.signAccessToken(payload);

    return { user: payload, accessToken };
  }
}
