import bcrypt from "bcrypt";

export default abstract class HashHelper {
  private static readonly SALT_ROUNDS = Number(
    process.env.BCRYPT_SALT_ROUNDS || 12
  );

  static async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.SALT_ROUNDS);
  }

  static async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
