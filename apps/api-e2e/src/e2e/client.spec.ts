import request from 'supertest';

import TestAgent from 'supertest/lib/agent';

import { INestApplication } from '@nestjs/common';

import { destroy } from '@owl-app/testing';
import { dataUsers } from '@owl-app/lib-api-core/seeds/data/users';

import { createTest } from '../create-test';
import { createAgent } from '../create-agent';
import { IJwtTokenService } from '@owl-app/lib-api-core/passport/jwt-token.interface';
import { User } from '@owl-app/lib-contracts';

describe('Client (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTest('client');
  });

  afterAll(async () => {
    await destroy(app);
  });

  describe.each([
    ['adminSystem', 200],
    ['adminCompany', 200],
    ['user', 403],
  ])('Subtraction', (user, status) => {
    let agent: TestAgent;

    beforeEach(async () => {
      agent = await createAgent(app, dataUsers[user].email);
    });

    it(`should list clients ${user}`, async () => {
      const response = await agent.get('/clients');

      expect(response.status).toEqual(status);

      if (status === 200) {
        expect(response.body).toHaveProperty('metadata.total', 0);
        expect(response.body).toHaveProperty('items', []);
      }
    });
  });
});
