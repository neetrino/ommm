import { Module } from "@nestjs/common";
import { R2HomeImageStorage } from "../storage/r2-home-image.storage";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService, R2HomeImageStorage],
  exports: [UsersService],
})
export class UsersModule {}
