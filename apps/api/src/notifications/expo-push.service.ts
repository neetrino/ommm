import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
};

export async function loadPushTokensForUser(
  prisma: PrismaService,
  userId: string,
): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ token: string }[]>(
    Prisma.sql`SELECT "token" FROM "PushDeviceToken" WHERE "userId" = ${userId}`,
  );
  return rows.map((r) => r.token);
}

@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger(ExpoPushService.name);

  async send(messages: ExpoPushMessage[]): Promise<void> {
    if (messages.length === 0) {
      return;
    }
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    const access = process.env.EXPO_ACCESS_TOKEN?.trim();
    if (access !== undefined && access !== '') {
      headers.Authorization = `Bearer ${access}`;
    }
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) {
        const t = await res.text();
        this.logger.warn(`Expo push failed HTTP ${res.status}: ${t.slice(0, 200)}`);
      }
    } catch (err) {
      this.logger.warn(
        `Expo push request error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
