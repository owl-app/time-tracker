export interface IJwtTokenPayload {
  email: string;
}

export type Token = {
  token: string;
  expiresIn?: number;
};

export interface IJwtTokenService<User> {
  createToken(payload: IJwtTokenPayload, secret: string, expiresIn: string): string;

  getJwtToken(email: string): Promise<Token>;

  getJwtRefreshToken(email: string): Promise<Token>;

  validateToken(pass: string, passwordHash: string): Promise<boolean>;

  validateUserForJWTStragtegy(email: string): Promise<User | null>;

  getUserIfRefreshTokenMatches(refreshToken: string, email: string): Promise<User | null>;

  removeRefreshToken(email: string): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const IJwtTokenService = Symbol('IJwtTokenService');
