import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '@owl-app/lib-contracts';
import { type IJwtConfig } from '@owl-app/lib-api-core/config/jwt';
import {
  IJwtTokenService,
  IJwtTokenPayload,
  Token,
} from '@owl-app/lib-api-core/passport/jwt-token.interface';
import { getMilliseconds } from '@owl-app/lib-api-core/utils/get-milliseconds';

import type { IUserRepository } from '../database/repository/user-repository.interface';

@Injectable()
export default class JwtTokenService implements IJwtTokenService<User> {
  constructor(
    private readonly jwtConfig: IJwtConfig,
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  createToken(payload: IJwtTokenPayload, secret: string, expiresIn: string): string {
    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }

  async getJwtToken(email: string): Promise<Token> {
    const payload: IJwtTokenPayload = { email };
    const secret = this.jwtConfig?.secret;
    const expiresIn = this.jwtConfig.expirationTime;
    const token = this.createToken(payload, secret, expiresIn);

    return { token, expiresIn: getMilliseconds(expiresIn) };
  }

  async getJwtRefreshToken(email: string): Promise<Token> {
    const payload: IJwtTokenPayload = { email };
    const secret = this.jwtConfig.refreshTokenSecret;
    const expiresIn = this.jwtConfig.refreshTokenExpirationTime;
    const token = this.createToken(payload, secret, expiresIn);

    await this.setCurrentRefreshToken(token, email);

    return { token, expiresIn: getMilliseconds(expiresIn) };
  }

  async validateToken(pass: string, passwordHash: string): Promise<boolean> {
    if (await bcrypt.compare(pass, passwordHash)) {
      return true;
    }

    return false;
  }

  async validateUserForJWTStragtegy(email: string): Promise<User | null> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      return null;
    }
    return user;
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, email: string): Promise<User | null> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      return null;
    }

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.hashRefreshToken);
    if (isRefreshTokenMatching) {
      return user;
    }

    return null;
  }

  public async removeRefreshToken(email: string): Promise<void> {
    await this.userRepository.updateRefreshToken(email, null);
  }

  private async setCurrentRefreshToken(refreshToken: string, email: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userRepository.updateRefreshToken(email, currentHashedRefreshToken);
  }
}
