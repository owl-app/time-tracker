import chalk from 'chalk';
import { urlencoded, json } from 'express';
import cookieParser from 'cookie-parser';

import { ClassSerializerInterceptor, INestApplication, NestModule } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { Class } from '@owl-app/types';
import { APP_CONFIG_NAME, IConfigApp } from '@owl-app/lib-api-core/config';
import { JwtAuthGuard } from '@owl-app/lib-api-core/passport/jwt.guard';
import { RoutePermissionGuard } from '@owl-app/lib-api-core/rbac/guards/route-permission.guard';

export async function bootstrap(bootstrapModule: Class<NestModule>): Promise<INestApplication> {
  const app = await NestFactory.create<NestExpressApplication>(bootstrapModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const allowedHeaders = [
    'Authorization',
    'Language',
    'X-Requested-With',
    'X-Auth-Token',
    'X-HTTP-Method-Override',
    'Content-Type',
    'Content-Language',
    'Accept',
    'Accept-Language',
    'Observe',
    'Set-Cookie',
    'Access-Control-Allow-Origin',
    'Referer',
  ];

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // // app.useLogger(app.get(SentryService));
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
    allowedHeaders: allowedHeaders.join(','),
  });

  const configService = app.get(ConfigService);
  const { version, prefix } = configService.get<IConfigApp>(APP_CONFIG_NAME);
  const globalPrefix = `${prefix}/${version}`;

  app.setGlobalPrefix(globalPrefix);

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalGuards(new RoutePermissionGuard(reflector));

  const options = new DocumentBuilder()
    .setTitle('Owl API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swg', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      useBasicAuthenticationWithAccessCodeGrant: true,
    },
  });

  let { port, host } = configService.get<IConfigApp>(APP_CONFIG_NAME);

  if (!port) {
    port = 3000;
  }
  if (!host) {
    host = '0.0.0.0';
  }

  console.log(chalk.green(`Host: ${host}`));
  console.log(chalk.green(`Port: ${port}`));

  console.log(chalk.magenta(`Swagger UI at http://${host}:${port}/swg`));

  await app.listen(port, host, () => {
    console.log(chalk.magenta(`Listening at http://${host}:${port}/${globalPrefix}`));
  });

  return app;
}
