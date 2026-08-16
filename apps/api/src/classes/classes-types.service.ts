import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ClassType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateClassTypeDto } from './dto/create-class-type.dto';
import type { UpdateClassTypeDto } from './dto/update-class-type.dto';
import { normalizeOptional } from './classes-session.helpers';

@Injectable()
export class ClassesTypesService {
  constructor(private readonly prisma: PrismaService) {}

  listTypes() {
    return this.prisma.classType.findMany({
      where: { archivedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async createType(dto: CreateClassTypeDto): Promise<ClassType> {
    const name = dto.name.trim();
    const slug =
      dto.slug !== undefined && dto.slug.trim().length > 0
        ? dto.slug.trim().toLowerCase()
        : this.buildSlugFromName(name);
    if (name.length === 0 || slug.length === 0) {
      throw new BadRequestException('Class type name and slug are required.');
    }
    await this.assertClassTypeUnique({ name, slug });
    return this.prisma.classType.create({
      data: {
        name,
        slug,
        description: normalizeOptional(dto.description),
      },
    });
  }

  async updateType(id: string, dto: UpdateClassTypeDto): Promise<ClassType> {
    const current = await this.findTypeOrThrow(id);
    if (current.archivedAt !== null) {
      throw new BadRequestException('Archived class types cannot be edited.');
    }
    const name = dto.name !== undefined ? dto.name.trim() : current.name;
    const slug =
      dto.slug !== undefined
        ? dto.slug.trim().toLowerCase()
        : dto.name !== undefined
          ? this.buildSlugFromName(name)
          : current.slug;
    if (name.length === 0 || slug.length === 0) {
      throw new BadRequestException('Class type name and slug are required.');
    }
    await this.assertClassTypeUnique({ name, slug, excludeId: id });
    return this.prisma.classType.update({
      where: { id },
      data: {
        name,
        slug,
        ...(dto.description !== undefined && {
          description: normalizeOptional(dto.description),
        }),
      },
    });
  }

  async assertClassTypeExists(classTypeId: string): Promise<void> {
    const classType = await this.prisma.classType.findUnique({
      where: { id: classTypeId },
      select: { id: true },
    });
    if (classType === null) {
      throw new BadRequestException('Class type not found');
    }
  }

  /** New sessions must use a catalog type that has not been archived in the UI. */
  async assertClassTypeAssignable(classTypeId: string): Promise<void> {
    const classType = await this.prisma.classType.findFirst({
      where: { id: classTypeId, archivedAt: null },
      select: { id: true },
    });
    if (classType === null) {
      throw new BadRequestException(
        'Class type is not available for new sessions.',
      );
    }
  }

  async resolveSessionTitle(
    title: string | undefined,
    classTypeId: string,
  ): Promise<string> {
    const trimmedTitle = title?.trim() ?? '';
    if (trimmedTitle.length > 0) {
      return trimmedTitle;
    }

    const classType = await this.prisma.classType.findUnique({
      where: { id: classTypeId },
      select: { name: true },
    });
    const classTypeName = classType?.name?.trim() ?? '';
    if (classTypeName.length === 0) {
      throw new BadRequestException('Class type is required.');
    }
    return classTypeName;
  }

  /**
   * Catalog delete is a soft-archive: the row and id stay so sessions,
   * bookings, and package balances keep working.
   */
  async deleteType(id: string): Promise<void> {
    const current = await this.findTypeOrThrow(id);
    if (current.archivedAt !== null) {
      return;
    }
    await this.prisma.classType.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  }

  private async findTypeOrThrow(id: string): Promise<ClassType> {
    const row = await this.prisma.classType.findUnique({ where: { id } });
    if (row === null) {
      throw new NotFoundException('Class type not found.');
    }
    return row;
  }

  private async assertClassTypeUnique(params: {
    name: string;
    slug: string;
    excludeId?: string;
  }): Promise<void> {
    const conflict = await this.prisma.classType.findFirst({
      where: {
        id:
          params.excludeId !== undefined
            ? { not: params.excludeId }
            : undefined,
        OR: [
          { slug: params.slug },
          { name: { equals: params.name, mode: 'insensitive' } },
        ],
      },
    });
    if (conflict !== null) {
      throw new BadRequestException(
        'A class type with this name or slug already exists.',
      );
    }
  }

  private buildSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .split('-')
      .filter((segment) => segment.length > 0)
      .join('-')
      .slice(0, 120);
  }
}
