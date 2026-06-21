import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateHomeSectionsDto } from './dto/update-home-sections.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { StudioService } from './studio.service';

@Controller('studio')
export class StudioController {
  constructor(private readonly studio: StudioService) {}

  /**
   * Public studio profile — used by marketing contact page and admin settings RSC.
   * Skip global throttle to avoid 429 under Next.js dev/prefetch bursts (same as GET /users/me).
   */
  @Get()
  @SkipThrottle()
  getPublic() {
    return this.studio.getPublic();
  }

  @Get('home-sections')
  @SkipThrottle()
  getHomeSections() {
    return this.studio.getHomeSections();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Body() dto: UpdateStudioDto) {
    return this.studio.update(dto);
  }

  @Patch('home-sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateHomeSections(@Body() dto: UpdateHomeSectionsDto) {
    return this.studio.updateHomeSections(dto.sections);
  }
}
