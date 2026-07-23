import { Module } from '@nestjs/common';
import { ExpoPushService } from './expo-push.service';
import { NotificationsAnalyticsService } from './notifications-analytics.service';
import { NotificationsBroadcastService } from './notifications-broadcast.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsCronService } from './notifications-cron.service';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsBroadcastService,
    NotificationsAnalyticsService,
    NotificationsCronService,
    ExpoPushService,
  ],
})
export class NotificationsModule {}
