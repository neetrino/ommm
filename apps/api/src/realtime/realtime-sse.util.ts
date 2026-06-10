import type { Response } from 'express';
import type { SseOutboundFrame } from './realtime.types';

export function applySseResponseHeaders(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
}

export function writeSseComment(res: Response, comment: string): void {
  if (res.writableEnded) {
    return;
  }
  res.write(`: ${comment}\n\n`);
}

export function writeSseFrame(res: Response, frame: SseOutboundFrame): void {
  if (res.writableEnded) {
    return;
  }
  res.write(`event: ${frame.event}\n`);
  res.write(`id: ${frame.id}\n`);
  res.write(`data: ${frame.data}\n\n`);
}

export function resolveClientIp(
  ip: string | undefined,
  forwardedFor: string | string[] | undefined,
): string {
  if (typeof forwardedFor === 'string' && forwardedFor.trim().length > 0) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }
  if (Array.isArray(forwardedFor) && forwardedFor[0]) {
    return forwardedFor[0].trim();
  }
  return ip?.trim() || 'unknown';
}
