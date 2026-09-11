import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { from, type Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrismaService } from './prisma.service';

/** Reconnect Prisma after Neon idle disconnect before handling the request. */
@Injectable()
export class PrismaEnsureConnectedInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return from(this.prisma.ensureConnected()).pipe(
      switchMap(() => next.handle()),
    );
  }
}
