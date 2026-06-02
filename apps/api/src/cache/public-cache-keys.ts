/** TTL for cached public marketing reads (seconds). */
export const PUBLIC_CACHE_TTL_SEC = {
  schedule: 120,
  coaches: 120,
  contentPosts: 300,
  contentPost: 300,
  studio: 600,
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
  contentPosts: (type?: string) =>
    publicCacheKey(type ? `content:posts:${type}` : 'content:posts'),
  contentPost: (slug: string) => publicCacheKey(`content:post:${slug}`),
  studio: publicCacheKey('studio'),
  contentPrefix: publicCacheKey('content'),
} as const;
