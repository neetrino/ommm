import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Role, type User } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CoachesService } from "./coaches.service";
import { CreateCoachDto } from "./dto/create-coach.dto";
import { UpdateCoachDto } from "./dto/update-coach.dto";

@Controller("coaches")
export class CoachesController {
  constructor(private readonly coaches: CoachesService) {}

  @Get()
  listPublic() {
    return this.coaches.listPublic();
  }

  @Get("admin/list")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  listAdmin() {
    return this.coaches.listAdmin();
  }

  @Get("panel/summary")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COACH)
  panelSummary(@CurrentUser() user: { id: string }) {
    return this.coaches.coachPanelSummary(user.id);
  }

  @Get(":id")
  getPublic(@Param("id") id: string) {
    return this.coaches.getPublic(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCoachDto) {
    return this.coaches.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.COACH)
  update(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: UpdateCoachDto,
  ) {
    return this.coaches.update(user, id, dto);
  }
}
