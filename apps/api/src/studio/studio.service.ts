import { Injectable } from '@nestjs/common';
import {
  normalizeEnabledLocales,
  normalizeHomePageSectionVisibility,
  parseEnabledLocalesJson,
  parseHomePageSectionVisibilityJson,
  serializeEnabledLocales,
  serializeHomePageSectionVisibility,
  type EnabledLocalesMap,
  type HomePageSectionVisibility,
} from '@ommm/database';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { normalizeOptionalContactPhone } from '../common/phone';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateGiftPolicyDto } from './dto/update-gift-policy.dto';
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
    return this.cache.getOrSet(
      PUBLIC_CACHE_KEYS.homeSections,
      PUBLIC_CACHE_TTL_SEC.homeSections,
      async () => {
        const row = await this.loadPublicFromDb();
        return {
          sections: parseHomePageSectionVisibilityJson(
            row.homeSectionsVisibilityJson,
          ),
        };
      },
    );
  }

  async getEnabledLocales() {
    return this.cache.getOrSet(
      PUBLIC_CACHE_KEYS.enabledLocales,
      PUBLIC_CACHE_TTL_SEC.enabledLocales,
      async () => {
        const row = await this.loadPublicFromDb();
        return {
          locales: parseEnabledLocalesJson(row.enabledLocalesJson),
        };
      },
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
    const normalized = normalizeHomePageSectionVisibility(sections);
    const current = await this.loadPublicFromDb();
    const updated = await this.prisma.studioSettings.update({
      where: { id: current.id },
      data: {
        homeSectionsVisibilityJson:
          serializeHomePageSectionVisibility(normalized),
      },
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.studio);
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.homeSections);
    return {
      sections: parseHomePageSectionVisibilityJson(
        updated.homeSectionsVisibilityJson,
      ),
    };
  }

  async updateGiftPolicy(dto: UpdateGiftPolicyDto) {
    const current = await this.loadPublicFromDb();
    const denominations = [...new Set(dto.denominationsAmd)].sort(
      (left, right) => left - right,
    );
    const updated = await this.prisma.studioSettings.update({
      where: { id: current.id },
      data: {
        giftCardMinAmountAmd: dto.minAmountAmd,
        giftCardValidityMonths: dto.validityMonths,
        giftCardDenominationsJson: JSON.stringify(denominations),
      },
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.studio);
    return {
      minAmountAmd: updated.giftCardMinAmountAmd,
      validityMonths: updated.giftCardValidityMonths,
      denominationsAmd: denominations,
    };
  }

  async updateEnabledLocales(locales: EnabledLocalesMap) {
    const normalized = normalizeEnabledLocales(locales);
    const current = await this.loadPublicFromDb();
    const updated = await this.prisma.studioSettings.update({
      where: { id: current.id },
      data: {
        enabledLocalesJson: serializeEnabledLocales(normalized),
      },
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.studio);
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.enabledLocales);
    return {
      locales: parseEnabledLocalesJson(updated.enabledLocalesJson),
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
