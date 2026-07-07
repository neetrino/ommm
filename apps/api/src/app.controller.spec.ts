import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  it('health returns ok when database is reachable', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();
    const controller = module.get(AppController);

    await expect(controller.health()).resolves.toEqual({
      status: 'ok',
      database: 'ok',
    });
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('health returns unhealthy when database check fails', async () => {
    const prisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('connection refused')),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();
    const controller = module.get(AppController);

    await expect(controller.health()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
