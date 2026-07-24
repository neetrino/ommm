import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { BACKOFFICE_WRITE_ROLES } from '../common/backoffice-roles';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateEnabledLocalesDto } from './dto/update-enabled-locales.dto';
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

  @Get('enabled-locales')
  @SkipThrottle()
  getEnabledLocales() {
    return this.studio.getEnabledLocales();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  update(@Body() dto: UpdateStudioDto) {
    return this.studio.update(dto);
  }

  @Patch('home-sections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  updateHomeSections(@Body() dto: UpdateHomeSectionsDto) {
    return this.studio.updateHomeSections(dto.sections);
  }

  @Patch('enabled-locales')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  updateEnabledLocales(@Body() dto: UpdateEnabledLocalesDto) {
    return this.studio.updateEnabledLocales(dto.locales);
  }
}
