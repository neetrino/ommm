import { Injectable } from '@nestjs/common';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoachesPublicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  listPublic() {
    return this.cache.getOrSet(
      PUBLIC_CACHE_KEYS.coaches,
      PUBLIC_CACHE_TTL_SEC.coaches,
      () =>
        this.prisma.coachProfile.findMany({
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        }),
    );
  }

  getPublic(id: string) {
    return this.prisma.coachProfile.findFirst({
      where: { id, isActive: true },
      include: {
        user: {
          select: { id: true, name: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }
}
