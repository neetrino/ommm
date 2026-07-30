import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  /** Process liveness — no DB (safe for Vercel warm-api; does not wake Neon). */
  @Get('health')
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /** DB readiness for deploy/manual checks. */
  @Get('ready')
  async ready(): Promise<{ status: 'ok'; database: 'ok' }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'ok' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'unhealthy',
        database: 'unavailable',
      });
    }
  }
}
