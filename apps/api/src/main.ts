import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Logger as PinoLogger } from "nestjs-pino";
import { AppModule } from "./app.module";
import { API_GLOBAL_PREFIX } from "./common/constants";

const API_DEFAULT_PORT = 4000;
const WEB_APP_DEFAULT_ORIGIN = "http://localhost:3000";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

function resolvePort(): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") {
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
  const appUrl = process.env.WEB_APP_URL ?? WEB_APP_DEFAULT_ORIGIN;
  app.enableCors({
    origin: appUrl,
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
  await app.listen(port);
}
bootstrap();
