import request from 'supertest';

import { INestApplication } from '@nestjs/common';

import { destroy } from '@owl-app/testing';

import { createTest } from '../create-test';

describe('Time (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTest('time');
  });

  afterAll(async () => {
    await destroy(app);
  });

  it('should list times', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/times')
      .set('Accept', 'application/json');

    expect(response.status).toEqual(401);
  });
});
