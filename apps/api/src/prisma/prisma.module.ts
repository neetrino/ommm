import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaEnsureConnectedInterceptor } from './prisma-ensure-connected.interceptor';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrismaEnsureConnectedInterceptor,
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
