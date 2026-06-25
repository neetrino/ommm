/** TTL for cached public marketing reads (seconds). */
export const PUBLIC_CACHE_TTL_SEC = {
  schedule: 120,
  coaches: 120,
  packages: 300,
  contentPosts: 300,
  contentPost: 300,
  studio: 600,
  homeSections: 60,
} as const;

function cacheEnvSegment(): string {
  return process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
}

/** Namespaced Redis key for public read cache entries. */
export function publicCacheKey(segment: string): string {
  return `ommm:${cacheEnvSegment()}:cache:public:${segment}`;
}

export const PUBLIC_CACHE_KEYS = {
  schedule: publicCacheKey('schedule'),
  coaches: publicCacheKey('coaches'),
  packages: publicCacheKey('packages'),
  contentPosts: (type?: string, locale?: string) =>
    publicCacheKey(
      type
        ? `content:posts:${type}:${locale ?? 'en'}`
        : `content:posts:all:${locale ?? 'en'}`,
    ),
  contentPost: (slug: string, locale?: string) =>
    publicCacheKey(`content:post:${slug}:${locale ?? 'en'}`),
  studio: publicCacheKey('studio'),
  homeSections: publicCacheKey('home-sections'),
  contentPrefix: publicCacheKey('content'),
} as const;
