export const API_DEFAULT_PORT = 4000;

/** Nest HTTP port — prefer `API_PORT` so root `.env` does not collide with Next `PORT`. */
export function resolveApiPort(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env.API_PORT ?? env.PORT;
  if (raw === undefined || raw === '') {
    return API_DEFAULT_PORT;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : API_DEFAULT_PORT;
}
