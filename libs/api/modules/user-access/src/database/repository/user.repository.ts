import { User } from '@owl-app/lib-contracts';

import { BaseRepository } from '@owl-app/lib-api-core/database/repository/base.repository';

import { UserEntity } from '../../domain/entity/user.entity';

import { IUserRepository } from './user-repository.interface';

export class UserRepository extends BaseRepository<UserEntity> implements IUserRepository {
  async findOneByIdString(id: string): Promise<User> {
    let user = null;

    if (id) {
      user = await this.findOne({
        where: {
          id,
        },
      });
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    if (email) {
      const user = await this.findOne({
        where: {
          email,
        },
        relations: {
          tenant: true,
        },
      });
      if (!user) {
        return null;
      }
      return user;
    }

    return null;
  }

  async updateRefreshToken(email: string, refreshToken: string | null): Promise<void> {
    await this.update(
      {
        email,
      },
      {
        hashRefreshToken: refreshToken,
      }
    );
  }

  async updateLastLogin(email: string): Promise<void> {
    await this.update(
      {
        email,
      },
      {
        lastLogin: () => 'CURRENT_TIMESTAMP',
      }
    );
  }

  async register(user: User): Promise<void> {
    await this.transaction(async () => this.save(user));
  }
}
