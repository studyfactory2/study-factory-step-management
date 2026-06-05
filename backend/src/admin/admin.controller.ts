import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { AdminOrCeoGuard } from "./guard/admin-or-ceo.guard";

@Controller("admin")
@UseGuards(JWTAuthGuard, AdminOrCeoGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  async getDashboard(@CurrentMember() currentMember: CurrentMemberType) {
    return this.adminService.getDashboard(currentMember.memberId);
  }

  @Get("employees")
  async getEmployees(@CurrentMember() currentMember: CurrentMemberType) {
    return this.adminService.getEmployees(currentMember.memberId);
  }

  @Get("branches/staff-counts")
  async getBranchStaffCounts(@CurrentMember() currentMember: CurrentMemberType) {
    return this.adminService.getBranchStaffCounts(currentMember.memberId);
  }
}
