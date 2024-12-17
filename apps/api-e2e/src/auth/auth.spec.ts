import request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { destroy } from '@owl-app/testing';
import { getMilliseconds } from '@owl-app/lib-api-core/utils/get-milliseconds';
import { IJwtConfig, JWT_CONFIG_NAME } from '@owl-app/lib-api-core/config';

import { createTest } from '../create-test';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let configService: ConfigService;

  beforeAll(async () => {
    app = await createTest('auth');
    configService = app.get(ConfigService);
  });

  afterAll(async () => {
    await destroy(app);
  });

  it('should login user', async () => {
    const { refreshTokenExpirationTime, expirationTime } =
      configService.get<IJwtConfig>(JWT_CONFIG_NAME);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Accept', 'application/json')
      .send({
        email: 'role_admin@wp.pl',
        password: 'test',
      });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      accessTokenExpires: getMilliseconds(expirationTime),
      refreshTokenExpires: getMilliseconds(refreshTokenExpirationTime),
    });
  });
});
