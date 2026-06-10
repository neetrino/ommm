import { Global, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RealtimePublisherService } from './realtime-publisher.service';
import { RealtimeSseController } from './realtime-sse.controller';

@Global()
@Module({
  imports: [AuthModule],
  controllers: [RealtimeSseController],
  providers: [RealtimePublisherService],
  exports: [RealtimePublisherService],
})
export class RealtimeModule {}
