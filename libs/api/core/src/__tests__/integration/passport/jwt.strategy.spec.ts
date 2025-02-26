import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Strategy } from 'passport-jwt';

import { RbacManager, Role } from '@owl-app/rbac-manager';
import { PermissionReferType } from '@owl-app/lib-contracts';

import { JwtStrategy } from '../../../passport/jwt.strategy';
import { JWT_CONFIG_PROVIDER, JwtConfig } from '../../../config/jwt';
import { IJwtTokenService } from '../../../passport/jwt-token.interface';
import { Permission } from '../../../rbac/types/permission';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let mockJwtConfig: JwtConfig;
  let mockJwtTokenService: Partial<IJwtTokenService<any>>;
  let mockRbacManager: Partial<RbacManager<Permission, Role>>;

  beforeEach(async () => {
    mockJwtConfig = {
      secret: 'testSecret',
      tokenClockTolerance: 10,
      expirationTime: '12h',
      cookie: {
        domain: 'testDomain',
        http_only: true,
        secure: true,
      },
      refreshTokenSecret: 'testRefreshSecret',
      refreshTokenExpirationTime: '1d',
    };
    mockJwtTokenService = {
      validateUserForJWTStragtegy: jest.fn(),
    };
    mockRbacManager = {
      getPermissionsByUserId: jest.fn(),
      getRolesByUserId: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: JWT_CONFIG_PROVIDER,
          useValue: mockJwtConfig,
        },
        {
          provide: IJwtTokenService,
          useValue: mockJwtTokenService,
        },
        {
          provide: 'RBAC_MANAGER',
          useValue: mockRbacManager,
        },
        JwtStrategy,
      ],
    }).compile();

    jwtStrategy = moduleRef.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
    expect(jwtStrategy).toBeInstanceOf(Strategy);
  });

  describe('validate', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      (mockJwtTokenService.validateUserForJWTStragtegy as jest.Mock).mockResolvedValue(null);
      await expect(jwtStrategy.validate({ email: 'test@example.com' })).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should return partial AuthUserData if user is found', async () => {
      (mockJwtTokenService.validateUserForJWTStragtegy as jest.Mock).mockResolvedValue({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        tenant: 'testTenant',
      });
      (mockRbacManager.getPermissionsByUserId as jest.Mock).mockResolvedValue([
        { name: 'ROUTE_SOMETHING', refer: PermissionReferType.ROUTE },
        { name: 'FIELD_SOMETHING', refer: PermissionReferType.FIELD },
      ]);
      (mockRbacManager.getRolesByUserId as jest.Mock).mockResolvedValue([
        { name: 'admin' },
        { name: 'user' },
      ]);

      const result = await jwtStrategy.validate({ email: 'test@example.com' });

      expect(result).toEqual({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        tenant: 'testTenant',
        roles: ['admin', 'user'],
        permissions: {
          routes: ['ROUTE_SOMETHING'],
          fields: ['FIELD_SOMETHING'],
        },
      });
    });
  });
});
