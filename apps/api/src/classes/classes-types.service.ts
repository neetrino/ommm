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
import { parseStoredTypeSessionAllocations } from '../packages/packages-plan.helpers';

@Injectable()
export class ClassesTypesService {
  constructor(private readonly prisma: PrismaService) {}

  listTypes() {
    return this.prisma.classType.findMany({ orderBy: { name: 'asc' } });
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

  async deleteType(id: string): Promise<void> {
    await this.findTypeOrThrow(id);
    await this.assertClassTypeSafeToDelete(id);
    await this.prisma.classType.delete({ where: { id } });
  }

  /**
   * Hard delete is allowed only when nothing depends on the type:
   * sessions, bookings, waitlist entries, package balances, or plan allocations.
   * Rename (update name/slug) remains unrestricted and keeps the same id.
   */
  private async assertClassTypeSafeToDelete(classTypeId: string): Promise<void> {
    const sessionCount = await this.prisma.classSession.count({
      where: { classTypeId },
    });
    if (sessionCount > 0) {
      throw new BadRequestException(
        `Cannot delete class type with ${sessionCount} linked class sessions.`,
      );
    }

    const bookingCount = await this.prisma.booking.count({
      where: { session: { classTypeId } },
    });
    if (bookingCount > 0) {
      throw new BadRequestException(
        `Cannot delete class type with ${bookingCount} linked bookings.`,
      );
    }

    const waitlistCount = await this.prisma.waitlistEntry.count({
      where: { session: { classTypeId } },
    });
    if (waitlistCount > 0) {
      throw new BadRequestException(
        `Cannot delete class type with ${waitlistCount} linked waitlist entries.`,
      );
    }

    const balanceCount = await (
      this.prisma as unknown as {
        userPackageBalance: {
          count(args: { where: { classTypeId: string } }): Promise<number>;
        };
      }
    ).userPackageBalance.count({
      where: { classTypeId },
    });
    if (balanceCount > 0) {
      throw new BadRequestException(
        `Cannot delete class type with ${balanceCount} linked package balances.`,
      );
    }

    const planReferenceCount = await this.countPlansReferencingClassType(
      classTypeId,
    );
    if (planReferenceCount > 0) {
      throw new BadRequestException(
        `Cannot delete class type referenced by ${planReferenceCount} package plan(s). Update plan allocations first.`,
      );
    }
  }

  private async countPlansReferencingClassType(
    classTypeId: string,
  ): Promise<number> {
    const plans = await this.prisma.packagePlan.findMany({
      select: {
        id: true,
        classTypeId: true,
        typeSessionAllocations: true,
      },
    });
    let count = 0;
    for (const plan of plans) {
      if (plan.classTypeId === classTypeId) {
        count += 1;
        continue;
      }
      const allocations = parseStoredTypeSessionAllocations(
        plan.typeSessionAllocations,
      );
      if (
        allocations.some(
          (allocation) => allocation.classTypeId === classTypeId,
        )
      ) {
        count += 1;
      }
    }
    return count;
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
