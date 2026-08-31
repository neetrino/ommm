import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@ommm/database';

const DEFAULT_IDLE_DISCONNECT_MS = 4 * 60 * 1000;
const DB_IDLE_MONITOR_INTERVAL_MS = 60 * 1000;
const PRISMA_IDLE_DISCONNECT_ENV = 'PRISMA_IDLE_DISCONNECT';
const PRISMA_IDLE_DISCONNECT_MS_ENV = 'PRISMA_IDLE_DISCONNECT_MS';
/** Bright red — idle disconnect is intentional but should stand out. */
const ANSI_BRIGHT_RED = '\x1b[91m';
const ANSI_BOLD = '\x1b[1m';
const ANSI_DIM = '\x1b[2m';
const ANSI_RESET = '\x1b[0m';

/** Pretty terminal banner for Prisma idle disconnect (exported for local preview). */
export function formatPrismaIdleDisconnectBanner(idleSeconds: number): string {
  const title = 'Prisma idle disconnect';
  const detail = `Disconnected after ${idleSeconds}s  ·  Neon scale-to-zero`;
  const width = Math.max(title.length, detail.length) + 4;
  const rule = '─'.repeat(width);
  return [
    `${ANSI_BRIGHT_RED}${ANSI_BOLD}┌${rule}${ANSI_RESET}`,
    `${ANSI_BRIGHT_RED}${ANSI_BOLD}│  ${title}${ANSI_RESET}`,
    `${ANSI_BRIGHT_RED}│  ${ANSI_DIM}${detail}${ANSI_RESET}`,
    `${ANSI_BRIGHT_RED}${ANSI_BOLD}└${rule}${ANSI_RESET}`,
  ].join('\n');
}

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly idleDisconnectEnabled: boolean;
  private readonly idleDisconnectMs: number;
  private lastDbActivityAt = Date.now();
  private idleDisconnectLogged = false;
  private idleMonitor: NodeJS.Timeout | null = null;
  private disconnectInFlight = false;
  private engineConnected = false;

  constructor() {
    super({
      log: [{ emit: 'event', level: 'query' }],
    });
    this.idleDisconnectEnabled = isIdleDisconnectEnabled(
      process.env[PRISMA_IDLE_DISCONNECT_ENV],
    );
    this.idleDisconnectMs = resolveIdleDisconnectMs(
      process.env[PRISMA_IDLE_DISCONNECT_MS_ENV],
    );
    this.$on('query', () => {
      this.lastDbActivityAt = Date.now();
      this.idleDisconnectLogged = false;
      this.engineConnected = true;
    });
  }

  onModuleInit(): void {
    // Lazy connect on first query — avoid holding Neon awake from boot.
    if (this.idleDisconnectEnabled) {
      this.startIdleMonitor();
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.idleMonitor !== null) {
      clearInterval(this.idleMonitor);
      this.idleMonitor = null;
    }
    await this.$disconnect();
    this.engineConnected = false;
  }

  private startIdleMonitor(): void {
    if (this.idleMonitor !== null) {
      return;
    }
    this.idleMonitor = setInterval(() => {
      void this.maybeDisconnectWhenIdle();
    }, DB_IDLE_MONITOR_INTERVAL_MS);
    this.idleMonitor.unref();
  }

  private async maybeDisconnectWhenIdle(): Promise<void> {
    if (!this.engineConnected || this.disconnectInFlight) {
      return;
    }
    const idleForMs = Date.now() - this.lastDbActivityAt;
    if (idleForMs < this.idleDisconnectMs) {
      return;
    }
    this.disconnectInFlight = true;
    try {
      await this.$disconnect();
      this.engineConnected = false;
      if (!this.idleDisconnectLogged) {
        this.idleDisconnectLogged = true;
        this.logger.log(
          `\n${formatPrismaIdleDisconnectBanner(Math.round(idleForMs / 1000))}`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Prisma idle disconnect failed: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
    } finally {
      this.disconnectInFlight = false;
    }
  }
}

function isIdleDisconnectEnabled(raw: string | undefined): boolean {
  if (raw === undefined || raw.trim() === '') {
    return true;
  }
  const normalized = raw.trim().toLowerCase();
  return normalized !== 'false' && normalized !== '0';
}

function resolveIdleDisconnectMs(raw: string | undefined): number {
  if (!raw?.trim()) {
    return DEFAULT_IDLE_DISCONNECT_MS;
  }
  const parsed = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 60_000) {
    return DEFAULT_IDLE_DISCONNECT_MS;
  }
  return parsed;
}
