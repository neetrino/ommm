import { Module } from '@nestjs/common';
import { CallTasksController } from './call-tasks.controller';
import { CallTasksService } from './call-tasks.service';

@Module({
  controllers: [CallTasksController],
  providers: [CallTasksService],
})
export class CallTasksModule {}
