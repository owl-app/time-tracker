import request, { Request, Test } from 'supertest';
import TestAgent from 'supertest/lib/agent';

import { INestApplication } from '@nestjs/common';

import { User } from '@owl-app/lib-contracts';

import { IJwtTokenService } from '@owl-app/lib-api-core/passport/jwt-token.interface';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG_NAME, IConfigApp } from '@owl-app/lib-api-core/config';

export async function createAgent(app: INestApplication, email: string): Promise<TestAgent<Test>> {
  const configService = app.get<ConfigService>(ConfigService);
  const { prefix, version } = configService.get<IConfigApp>(APP_CONFIG_NAME);
  const fullPrefix = `/${prefix}/${version}`;
  const jwtTokenService = app.get<IJwtTokenService<User>>(IJwtTokenService);
  const token = await jwtTokenService.getJwtToken(email);

  return request
    .agent(app.getHttpServer())
    .use((req: Request) => {
      if (req.url[0] === '/') {
        req.url = `${fullPrefix}/${version}${req.url}`;
        return req;
      }

      const protocol = req.url.substring(0, req.url.indexOf('://') + 3);
      const path = req.url.substring(req.url.indexOf('://') + 3, req.url.length);
      const newPath =
        path.substring(0, path.indexOf('/')) +
        fullPrefix +
        path.substring(path.indexOf('/'), path.length);

      req.url = protocol + newPath;

      return req;
    })
    .set('Cookie', `access_token=${token.token}`);
}
