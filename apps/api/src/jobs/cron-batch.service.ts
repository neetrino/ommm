import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BookingsStatusTransitionService } from '../bookings/bookings-status-transition.service';
import { NotificationsCronService } from '../notifications/notifications-cron.service';
import { PackagesActivationService } from '../packages/packages-activation.service';
import { PackagesFreezeService } from '../packages/packages-freeze.service';
import { ArcaReconciliationService } from '../payments/arca/arca-reconciliation.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { WhatsappMembershipExpiryService } from '../whatsapp/whatsapp-membership-expiry.service';
import { resolveCronBatchSchedule } from './cron-batch.constants';

/**
 * Single :00/:30 batch so all DB jobs share one Neon wake window.
 * Per-job env gates stay inside the called methods.
 */
@Injectable()
export class CronBatchService {
  private readonly logger = new Logger(CronBatchService.name);

  constructor(
    private readonly waitlist: WaitlistService,
    private readonly bookingsStatus: BookingsStatusTransitionService,
    private readonly notificationsCron: NotificationsCronService,
    private readonly arcaReconciliation: ArcaReconciliationService,
    private readonly packagesFreeze: PackagesFreezeService,
    private readonly packagesActivation: PackagesActivationService,
    private readonly membershipExpiry: WhatsappMembershipExpiryService,
  ) {}

  @Cron(resolveCronBatchSchedule())
  async runBatch(): Promise<void> {
    this.logger.log('Cron batch started');
    try {
      await this.waitlist.expireOffersCron();
      await this.bookingsStatus.completePastBookedSessionsCron();
      await this.notificationsCron.dispatchScheduledBroadcasts();
      await this.notificationsCron.sendClassReminders();
      await this.membershipExpiry.sendDueReminders();
      await this.arcaReconciliation.reconcilePendingPaymentsCron();
      await this.packagesFreeze.resumeDueFreezes();
      await this.packagesActivation.reconcileAwaitingPackages();
      this.logger.log('Cron batch finished');
    } catch (error) {
      this.logger.error(
        'Cron batch failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
