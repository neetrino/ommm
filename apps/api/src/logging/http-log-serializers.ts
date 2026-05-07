import type { IncomingMessage, ServerResponse } from "node:http";

type RequestWithId = IncomingMessage & { id?: string | number };

/**
 * Minimal request/response shapes for access logs (no headers / cookies).
 */
export function createHttpAccessLogSerializers(): {
  req: (req: RequestWithId) => { id: string | number | undefined; method: string | undefined; path: string | undefined };
  res: (res: ServerResponse) => { statusCode: number };
} {
  return {
    req: (req: RequestWithId) => ({
      id: req.id,
      method: req.method,
      path: req.url === undefined ? undefined : req.url.split("?")[0],
    }),
    res: (res: ServerResponse) => ({
      statusCode: res.statusCode ?? 0,
    }),
  };
}
