import path from 'node:path';
import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CallTasksModule } from './call-tasks/call-tasks.module';
import { CacheModule } from './cache/cache.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { ClassesModule } from './classes/classes.module';
import { ClientsModule } from './clients/clients.module';
import { CoachesModule } from './coaches/coaches.module';
import { ContentModule } from './content/content.module';
import { GiftCardsModule } from './gift-cards/gift-cards.module';
import { JobsModule } from './jobs/jobs.module';
import { MailModule } from './mail/mail.module';
import { ManagersModule } from './managers/managers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ReportsModule } from './reports/reports.module';
import { SessionReviewsModule } from './session-reviews/session-reviews.module';
import { StaffActivityModule } from './staff-activity/staff-activity.module';
import { ScheduleItemsModule } from './schedule/schedule.module';
import { StudioModule } from './studio/studio.module';
import { UsersModule } from './users/users.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { PackagesModule } from './packages/packages.module';
import { createHttpAccessLogSerializers } from './logging/http-log-serializers';

const apiPackageRoot = process.cwd();
const monorepoRoot = path.join(apiPackageRoot, '..', '..');

const httpAccessSerializers = createHttpAccessLogSerializers();

function createPinoHttpConfig(): Record<string, unknown> {
  const level = process.env.LOG_LEVEL ?? 'info';
  const base: Record<string, unknown> = {
    level,
    serializers: httpAccessSerializers,
  };
  if (process.env.NODE_ENV === 'production') {
    return base;
  }
  return {
    ...base,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: true,
      },
    },
  };
}

@Module({
  imports: [
    AuditModule,
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
        path.join(apiPackageRoot, '.env.local'),
        path.join(apiPackageRoot, '.env'),
        path.join(monorepoRoot, '.env.local'),
        path.join(monorepoRoot, '.env'),
      ],
    }),
    CacheModule,
    RealtimeModule,
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    StudioModule,
    CoachesModule,
    ClassesModule,
    BookingsModule,
    WaitlistModule,
    PaymentsModule,
    GiftCardsModule,
    PackagesModule,
    ContentModule,
    ReportsModule,
    NotificationsModule,
    ClientsModule,
    ManagersModule,
    CallTasksModule,
    SessionReviewsModule,
    StaffActivityModule,
    ScheduleItemsModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
