import request from 'supertest';

import { INestApplication } from '@nestjs/common';

import { destroy } from '@owl-app/testing';

import { createTest } from '../create-test';

describe('Client (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTest('client');
  });

  afterAll(async () => {
    await destroy(app);
  });

  it('should list clients', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/clients')
      .set('Accept', 'application/json');

    expect(response.status).toEqual(401);
  });
});
