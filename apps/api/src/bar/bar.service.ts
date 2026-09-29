import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateBarProductDto } from './bar.dto';

@Injectable()
export class BarService {
  constructor(private readonly prisma: PrismaService) {}

  listActive() {
    return this.prisma.barProduct.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  listAll() {
    return this.prisma.barProduct.findMany({ orderBy: { name: 'asc' } });
  }

  create(dto: CreateBarProductDto) {
    return this.prisma.barProduct.create({
      data: { name: dto.name.trim(), priceAmd: dto.priceAmd, active: true },
    });
  }

  async setActive(id: string, active: boolean) {
    const product = await this.prisma.barProduct.findUnique({ where: { id } });
    if (product === null) {
      throw new NotFoundException('Bar item not found');
    }
    return this.prisma.barProduct.update({ where: { id }, data: { active } });
  }
}
