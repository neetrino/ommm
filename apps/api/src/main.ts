import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import express from 'express';
import { AppModule } from './app.module';
import { API_GLOBAL_PREFIX } from './common/constants';
import { resolveApiPort } from './common/resolve-api-port';
import { createNestCorsOriginDelegate } from './cors-origin';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/** Max JSON body size for base64 home-image uploads (≈5 MiB file → ~7 MiB base64). */
const JSON_BODY_LIMIT = '12mb';

function resolvePort(): number {
  return resolveApiPort();
}

async function bootstrap() {
  const uploadsDir = join(process.cwd(), 'uploads');
  mkdirSync(uploadsDir, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));
  if (IS_PRODUCTION) {
    app.useLogger(app.get(PinoLogger));
  } else {
    app.useLogger(new ConsoleLogger());
  }
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: createNestCorsOriginDelegate(),
    credentials: true,
  });
  app.useStaticAssets(uploadsDir, {
    prefix: '/v1/uploads/',
    index: false,
  });
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = resolvePort();
  /** Prefer IPv4 all interfaces so Android emulator (`10.0.2.2`) and LAN devices can reach the API. */
  const listenHost = process.env.API_LISTEN_HOST?.trim() || '0.0.0.0';
  await app.listen(port, listenHost);
  console.log(
    `[api] listening on http://${listenHost === '0.0.0.0' ? '127.0.0.1' : listenHost}:${port}/${API_GLOBAL_PREFIX} (health: /${API_GLOBAL_PREFIX}/health)`,
  );
}
void bootstrap();
