import { Injectable, Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly client: Redis | null;

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (url && token) {
      this.client = new Redis({ url, token });
      this.logger.log('Upstash Redis public-read cache enabled.');
      return;
    }
    this.client = null;
    this.logger.log(
      'Upstash Redis not configured; public read cache uses database directly.',
    );
  }

  /** Returns cached JSON or loads fresh data and stores it with TTL. */
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    if (!this.client) {
      return loader();
    }

    try {
      const cached = await this.client.get<string>(key);
      if (typeof cached === 'string' && cached.length > 0) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      this.logger.warn(
        `Redis get failed for ${key}; falling back to loader.`,
        error instanceof Error ? error.message : String(error),
      );
    }

    const fresh = await loader();
    try {
      await this.client.set(key, JSON.stringify(fresh), { ex: ttlSeconds });
    } catch (error) {
      this.logger.warn(
        `Redis set failed for ${key}.`,
        error instanceof Error ? error.message : String(error),
      );
    }
    return fresh;
  }

  async invalidate(key: string): Promise<void> {
    if (!this.client) {
      return;
    }
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.warn(
        `Redis del failed for ${key}.`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /** Deletes all keys that start with the given prefix. */
  async invalidateByPrefix(prefix: string): Promise<void> {
    if (!this.client) {
      return;
    }
    try {
      const keys = await this.client.keys(`${prefix}*`);
      if (keys.length === 0) {
        return;
      }
      await this.client.del(...keys);
    } catch (error) {
      this.logger.warn(
        `Redis prefix invalidation failed for ${prefix}.`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
