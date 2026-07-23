import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@ommm/database';

const DB_IDLE_WINDOW_MS = 5 * 60 * 1000;
const DB_IDLE_MONITOR_INTERVAL_MS = 60 * 1000;

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly idleWindowMinutes = DB_IDLE_WINDOW_MS / 60_000;
  private lastDbActivityAt = Date.now();
  private idleWindowLogged = false;
  private idleMonitor: NodeJS.Timeout | null = null;

  constructor() {
    super({
      log: [{ emit: 'event', level: 'query' }],
    });
    this.$on('query', () => {
      this.lastDbActivityAt = Date.now();
      this.idleWindowLogged = false;
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.startIdleMonitor();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.idleMonitor !== null) {
      clearInterval(this.idleMonitor);
      this.idleMonitor = null;
    }
    await this.$disconnect();
  }

  private startIdleMonitor(): void {
    if (this.idleMonitor !== null) {
      return;
    }
    this.idleMonitor = setInterval(() => {
      const idleForMs = Date.now() - this.lastDbActivityAt;
      if (idleForMs < DB_IDLE_WINDOW_MS || this.idleWindowLogged) {
        return;
      }
      this.idleWindowLogged = true;
      this.logger.log(
        `No database activity detected for ${this.idleWindowMinutes} minutes.`,
      );
    }, DB_IDLE_MONITOR_INTERVAL_MS);
    this.idleMonitor.unref();
  }
}
