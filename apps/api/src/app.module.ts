import path from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const apiPackageRoot = process.cwd();
const monorepoRoot = path.join(apiPackageRoot, '..', '..');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.join(apiPackageRoot, '.env.local'),
        path.join(apiPackageRoot, '.env'),
        path.join(monorepoRoot, '.env.local'),
        path.join(monorepoRoot, '.env'),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
