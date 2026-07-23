/** Guest public schedule list — short CDN/browser TTL; spot counts refresh via SSE on clients. */
export const PUBLIC_SCHEDULE_HTTP_CACHE_CONTROL =
  'public, max-age=15, stale-while-revalidate=30';
