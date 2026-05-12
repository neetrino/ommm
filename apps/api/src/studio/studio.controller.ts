import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { StudioService } from './studio.service';

@Controller('studio')
export class StudioController {
  constructor(private readonly studio: StudioService) {}

  @Get()
  getPublic() {
    return this.studio.getPublic();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Body() dto: UpdateStudioDto) {
    return this.studio.update(dto);
  }
}
