import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { API_GLOBAL_PREFIX } from './common/constants';
import { createNestCorsOriginDelegate } from './cors-origin';

const API_DEFAULT_PORT = 4000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function resolvePort(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === '') {
    return API_DEFAULT_PORT;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : API_DEFAULT_PORT;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bufferLogs: true,
  });
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
}
void bootstrap();
