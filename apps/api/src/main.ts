import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const API_DEFAULT_PORT = 4000;
const WEB_APP_DEFAULT_ORIGIN = 'http://localhost:3000';

function resolvePort(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === '') {
    return API_DEFAULT_PORT;
  }
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : API_DEFAULT_PORT;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appUrl = process.env.APP_URL ?? WEB_APP_DEFAULT_ORIGIN;
  app.enableCors({ origin: appUrl, credentials: true });
  const port = resolvePort();
  await app.listen(port);
}
bootstrap();
