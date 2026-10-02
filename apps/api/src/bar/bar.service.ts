import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateBarProductDto, UpdateBarProductDto } from './bar.dto';

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

  async update(id: string, dto: UpdateBarProductDto) {
    const existing = await this.prisma.barProduct.findUnique({ where: { id } });
    if (existing === null) {
      throw new NotFoundException('Bar item not found');
    }
    const data = toBarProductPatch(dto);
    if (Object.keys(data).length === 0) {
      return existing;
    }
    return this.prisma.barProduct.update({ where: { id }, data });
  }
}

function toBarProductPatch(dto: UpdateBarProductDto): {
  name?: string;
  priceAmd?: number;
  active?: boolean;
} {
  const data: { name?: string; priceAmd?: number; active?: boolean } = {};
  if (dto.name !== undefined) {
    const name = dto.name.trim();
    if (name.length === 0) {
      throw new BadRequestException('Name is required');
    }
    data.name = name;
  }
  if (dto.priceAmd !== undefined) {
    data.priceAmd = dto.priceAmd;
  }
  if (dto.active !== undefined) {
    data.active = dto.active;
  }
  return data;
}
