import { Injectable } from '@nestjs/common';
import {
  parseHomePageSectionVisibilityJson,
  serializeHomePageSectionVisibility,
  type HomePageSectionVisibility,
} from '@ommm/database';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { normalizeOptionalContactPhone } from '../common/phone';
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
      async () => this.withParsedHomeSections(await this.loadPublicFromDb()),
    );
  }

  async getHomeSections() {
    const row = await this.loadPublicFromDb();
    return {
      sections: parseHomePageSectionVisibilityJson(
        row.homeSectionsVisibilityJson,
      ),
    };
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
    const data = {
      ...dto,
      ...(dto.contactPhone !== undefined && {
        contactPhone: normalizeOptionalContactPhone(dto.contactPhone),
      }),
    };
    const updated = await this.prisma.studioSettings.update({
      where: { id: current.id },
      data,
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.studio);
    return this.withParsedHomeSections(updated);
  }

  async updateHomeSections(sections: HomePageSectionVisibility) {
    const current = await this.loadPublicFromDb();
    const updated = await this.prisma.studioSettings.update({
      where: { id: current.id },
      data: {
        homeSectionsVisibilityJson:
          serializeHomePageSectionVisibility(sections),
      },
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.studio);
    return {
      sections: parseHomePageSectionVisibilityJson(
        updated.homeSectionsVisibilityJson,
      ),
    };
  }

  private withParsedHomeSections<
    T extends { homeSectionsVisibilityJson: string | null },
  >(row: T) {
    return {
      ...row,
      homeSectionsVisibility: parseHomePageSectionVisibilityJson(
        row.homeSectionsVisibilityJson,
      ),
    };
  }
}
