import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ClassSessionStatus, Role } from "@prisma/client";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ClassesService } from "./classes.service";
import { CreateClassTypeDto } from "./dto/create-class-type.dto";
import { CreateSessionDto } from "./dto/create-session.dto";

@Controller("classes")
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Get("types")
  listTypes() {
    return this.classes.listTypes();
  }

  @Post("types")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  createType(@Body() dto: CreateClassTypeDto) {
    return this.classes.createType(dto);
  }

  @Delete("types/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteType(@Param("id") id: string) {
    return this.classes.deleteType(id);
  }

  @Get("sessions")
  listSessions(
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("coachId") coachId?: string,
    @Query("typeId") typeId?: string,
  ) {
    const fromD = new Date(from);
    const toD = new Date(to);
    return this.classes.listSessionsPublic({
      from: fromD,
      to: toD,
      coachId,
      typeId,
    });
  }

  @Get("sessions/:id")
  getSession(@Param("id") id: string) {
    return this.classes.getSessionPublic(id);
  }

  @Post("sessions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  createSession(@Body() dto: CreateSessionDto) {
    return this.classes.createSession(dto);
  }

  @Post("sessions/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  setStatus(
    @Param("id") id: string,
    @Body("status") status: ClassSessionStatus,
  ) {
    return this.classes.updateSessionStatus(id, status);
  }

  @Delete("sessions/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteSession(@Param("id") id: string) {
    return this.classes.deleteSession(id);
  }
}
