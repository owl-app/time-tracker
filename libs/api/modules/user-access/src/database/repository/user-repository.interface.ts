import { User } from '@owl-app/lib-contracts';

export interface IUserRepository {
  findOneByIdString(id: string): Promise<User>;

  getUserByEmail(email: string): Promise<User>;

  updateLastLogin(username: string): Promise<void>;

  updateRefreshToken(email: string, refreshToken: string | null): Promise<void>;

  register(user: User): Promise<void>;
}
