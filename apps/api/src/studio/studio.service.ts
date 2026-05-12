import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateStudioDto } from './dto/update-studio.dto';

@Injectable()
export class StudioService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic() {
    const row = await this.prisma.studioSettings.findFirst();
    if (!row) {
      return this.prisma.studioSettings.create({
        data: { studioName: 'Ommm' },
      });
    }
    return row;
  }

  async update(dto: UpdateStudioDto) {
    const current = await this.getPublic();
    return this.prisma.studioSettings.update({
      where: { id: current.id },
      data: dto,
    });
  }
}
