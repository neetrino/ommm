import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type AuditLogParams = {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  payload?: unknown;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private static readonly RETRY_DELAY_MS = 150;

  constructor(private readonly prisma: PrismaService) {}

  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.createAuditLog(params);
      return;
    } catch (error) {
      if (!this.isRetryableConnectionError(error)) {
        this.logger.error(
          `Audit log write failed for action "${params.action}" on ${params.entityType}:${params.entityId}`,
          error instanceof Error ? error.stack : undefined,
        );
        return;
      }
    }

    this.logger.warn(
      `Audit log write hit a transient DB connection issue, retrying once for ${params.entityType}:${params.entityId}.`,
    );

    try {
      await this.waitBeforeRetry();
      await this.createAuditLog(params);
    } catch (retryError) {
      this.logger.error(
        `Audit log retry failed for action "${params.action}" on ${params.entityType}:${params.entityId}`,
        retryError instanceof Error ? retryError.stack : undefined,
      );
    }
  }

  private createAuditLog(params: AuditLogParams): Promise<unknown> {
    return this.prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        actorRole: params.actorRole ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        payload:
          params.payload === undefined ? null : JSON.stringify(params.payload),
      },
    });
  }

  private isRetryableConnectionError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P1017' || error.code === 'P2024')
    );
  }

  private async waitBeforeRetry(): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, AuditService.RETRY_DELAY_MS);
    });
  }
}
