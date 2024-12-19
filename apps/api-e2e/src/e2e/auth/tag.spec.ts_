import request from 'supertest';

import { INestApplication } from '@nestjs/common';

import { destroy } from '@owl-app/testing';

import { createTest } from '../create-test';

describe('Tag (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTest('tag');
  });

  afterAll(async () => {
    await destroy(app);
  });

  it('should list tags', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/tags')
      .set('Accept', 'application/json');

    expect(response.status).toEqual(401);
  });
});
