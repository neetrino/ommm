import { Injectable } from '@nestjs/common';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateStudioDto } from './dto/update-studio.dto';

@Injectable()
export class StudioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  async getPublic() {
    return this.cache.getOrSet(
      PUBLIC_CACHE_KEYS.studio,
      PUBLIC_CACHE_TTL_SEC.studio,
      () => this.loadPublicFromDb(),
    );
  }

  private async loadPublicFromDb() {
    const row = await this.prisma.studioSettings.findFirst();
    if (!row) {
      return this.prisma.studioSettings.create({
        data: { studioName: 'Ommm' },
      });
    }
    return row;
  }

  async update(dto: UpdateStudioDto) {
    const current = await this.loadPublicFromDb();
    const updated = await this.prisma.studioSettings.update({
      where: { id: current.id },
      data: dto,
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.studio);
    return updated;
  }
}
