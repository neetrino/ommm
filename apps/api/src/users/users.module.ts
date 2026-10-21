import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { AccountDeletionService } from './account-deletion.service';
import { UsersController } from './users.controller';
import { UsersHomeImageService } from './users-home-image.service';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersHomeImageService,
    AccountDeletionService,
    R2HomeImageStorage,
  ],
  exports: [UsersService],
})
export class UsersModule {}
