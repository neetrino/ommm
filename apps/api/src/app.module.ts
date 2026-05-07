import path from "node:path";
import { Module, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import { ClassesModule } from "./classes/classes.module";
import { ClientsModule } from "./clients/clients.module";
import { CoachesModule } from "./coaches/coaches.module";
import { ContactModule } from "./contact/contact.module";
import { ContentModule } from "./content/content.module";
import { GiftCardsModule } from "./gift-cards/gift-cards.module";
import { MailModule } from "./mail/mail.module";
import { MembershipsModule } from "./memberships/memberships.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { PaymentsModule } from "./payments/payments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ReportsModule } from "./reports/reports.module";
import { StudioModule } from "./studio/studio.module";
import { UsersModule } from "./users/users.module";
import { WaitlistModule } from "./waitlist/waitlist.module";

const apiPackageRoot = process.cwd();
const monorepoRoot = path.join(apiPackageRoot, "..", "..");

function createPinoHttpConfig(): {
  level: string;
  transport?: { target: string; options: Record<string, unknown> };
} {
  const level = process.env.LOG_LEVEL ?? "info";
  if (process.env.NODE_ENV === "production") {
    return { level };
  }
  return {
    level,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
        singleLine: false,
      },
    },
  };
}

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: createPinoHttpConfig(),
      // Avoid legacy `*` + global prefix `/v1/*` (path-to-regexp v8 warnings in nestjs-pino defaults).
      forRoutes: [{ path: '{*path}', method: RequestMethod.ALL }],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.join(apiPackageRoot, ".env.local"),
        path.join(apiPackageRoot, ".env"),
        path.join(monorepoRoot, ".env.local"),
        path.join(monorepoRoot, ".env"),
      ],
    }),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    StudioModule,
    ContactModule,
    CoachesModule,
    ClassesModule,
    BookingsModule,
    WaitlistModule,
    MembershipsModule,
    PaymentsModule,
    GiftCardsModule,
    ContentModule,
    ReportsModule,
    NotificationsModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
