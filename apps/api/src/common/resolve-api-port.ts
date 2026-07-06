export const API_DEFAULT_PORT = 4000;

/** Nest HTTP port — prefer Cloud Run `PORT`, then fallback to local `API_PORT`. */
export function resolveApiPort(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.PORT ?? env.API_PORT;
  if (raw === undefined || raw === '') {
    return API_DEFAULT_PORT;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : API_DEFAULT_PORT;
}
