import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { MembershipStatus, Role } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreatePlanDto } from "./dto/create-plan.dto";
import { MembershipsService } from "./memberships.service";

@Controller("memberships")
export class MembershipsController {
  constructor(private readonly memberships: MembershipsService) {}

  @Get("plans")
  listPlans() {
    return this.memberships.listPlans();
  }

  @Post("plans")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createPlan(@Body() dto: CreatePlanDto) {
    return this.memberships.createPlan(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: { id: string }) {
    return this.memberships.listMine(user.id);
  }

  @Patch("me/:id/pause")
  @UseGuards(JwtAuthGuard)
  pause(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.memberships.pause(user.id, id);
  }

  @Patch("me/:id/cancel")
  @UseGuards(JwtAuthGuard)
  cancel(@CurrentUser() user: { id: string }, @Param("id") id: string) {
    return this.memberships.cancel(user.id, id);
  }

  @Get("admin/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminAll() {
    return this.memberships.listAllAdmin();
  }

  @Post("admin/assign")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  assign(
    @Body("userId") userId: string,
    @Body("planId") planId: string,
  ) {
    return this.memberships.assignManual(userId, planId);
  }

  @Patch("admin/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminStatus(
    @Param("id") id: string,
    @Body("status") status: MembershipStatus,
  ) {
    return this.memberships.adminSetStatus(id, status);
  }
}
