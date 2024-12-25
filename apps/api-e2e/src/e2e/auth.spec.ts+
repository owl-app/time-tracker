import request from 'supertest';

import { ConfigService } from '@nestjs/config';

import { TestServer } from '@owl-app/testing';

import { AvailableRoles, RolesEnum } from '@owl-app/lib-contracts';

import { getMilliseconds } from '@owl-app/lib-api-core/utils/get-milliseconds';
import { IJwtConfig, JWT_CONFIG_NAME } from '@owl-app/lib-api-core/config';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';

import { createTest } from '../create-test';

describe('Auth (e2e)', () => {
  let testServer: TestServer;
  let configService: ConfigService;

  beforeAll(async () => {
    testServer = await createTest({ dbName: 'auth' });
    configService = testServer.app.get(ConfigService);
  });

  afterAll(async () => {
    await testServer.close();
  });

  describe.each<RolesEnum>(AvailableRoles)('Login by role', (role) => {
    it(`should login user ${role}`, async () => {
      const { refreshTokenExpirationTime, expirationTime } =
        configService.get<IJwtConfig>(JWT_CONFIG_NAME);

      const response = await request(testServer.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Accept', 'application/json')
        .send({
          email: dataUsers[role].email,
          password: dataUsers[role].password,
        });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        accessTokenExpires: getMilliseconds(expirationTime),
        refreshTokenExpires: getMilliseconds(refreshTokenExpirationTime),
      });
    });
  });

  it(`should invalid data`, async () => {
    const response = await request(testServer.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Accept', 'application/json')
      .send({});

    expect(response.status).toEqual(422);
    expect(response.body).toHaveProperty('errors.email');
    expect(response.body).toHaveProperty('errors.password');
  });

  it(`should invalid credentials`, async () => {
    const response = await request(testServer.getHttpServer())
      .post('/api/v1/auth/login')
      .set('Accept', 'application/json')
      .send({
        email: 'invalid@example.com',
        password: 'invalid',
      });

    expect(response.status).toEqual(422);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error', 'Unprocessable Entity');
    expect(response.body).toHaveProperty('statusCode', 422);
  });
});
