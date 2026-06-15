import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { Member } from "../member/entity/member.entity";
import { Organization } from "../member/entity/organization.entity";
import { Position } from "../position/entity/position.entity";
import { OrganizationChartNode } from "./entity/organization-chart-node.entity";
import { OrganizationChart } from "./entity/organization-chart.entity";
import { OrganizationChartController } from "./organization-chart.controller";
import { OrganizationChartRepository } from "./organization-chart.repository";
import { OrganizationChartService } from "./organization-chart.service";

@Module({
  imports: [TypeOrmModule.forFeature([Member, Organization, OrganizationChart, OrganizationChartNode, Position])],
  controllers: [OrganizationChartController],
  providers: [OrganizationChartService, OrganizationChartRepository, JWTAuthGuard, AdminOrCeoGuard],
  exports: [OrganizationChartService, OrganizationChartRepository]
})
export class OrganizationChartModule {}
