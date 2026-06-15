import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { OrganizationChartUpdateRequest } from "./dto/organization-chart-update.request";
import { OrganizationChartService } from "./organization-chart.service";

@Controller("organization-chart")
export class OrganizationChartController {
  constructor(private readonly organizationChartService: OrganizationChartService) {}

  @Get("active")
  async findActive() {
    return this.organizationChartService.findActive();
  }

  @Post("active/reset-from-position-tree")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async resetFromPositionTree() {
    return this.organizationChartService.resetFromPositionTree();
  }

  @Patch("active")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async updateActive(@Body() request: OrganizationChartUpdateRequest) {
    return this.organizationChartService.updateActive(request);
  }
}
