import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { MemberPreRegisterRequest } from "./dto/member-pre-register.request";
import { MemberRegisterRequest } from "./dto/member-register.request";
import { OrganizationUpdateRequest } from "./dto/organization-update.request";
import { MemberService } from "./member.service";

@Controller("members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  async findAll() {
    return this.memberService.findAll();
  }

  @Get("branches")
  async findBranches() {
    return this.memberService.findBranches();
  }

  @Get("organizations")
  async findOrganizations() {
    return this.memberService.findOrganizations();
  }

  @Patch("organizations")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async updateOrganizations(@Body() request: OrganizationUpdateRequest) {
    return this.memberService.updateOrganizations(request);
  }

  @Post("pre-registrations")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async preRegister(@Body() request: MemberPreRegisterRequest) {
    return this.memberService.preRegister(request);
  }

  @Get("pre-registrations")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async findPreRegistrations() {
    return this.memberService.findPreRegistrations();
  }

  @Patch("pre-registrations/:id")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async updatePreRegistration(
    @Param("id", ParseIntPipe) id: number,
    @Body() request: MemberPreRegisterRequest
  ) {
    return this.memberService.updatePreRegistration(id, request);
  }

  @Delete("pre-registrations/:id")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async deletePreRegistration(@Param("id", ParseIntPipe) id: number) {
    return this.memberService.deletePreRegistration(id);
  }

  @Get(":id")
  async findById(@Param("id", ParseIntPipe) id: number) {
    return this.memberService.findById(id);
  }

  @Post("register")
  async register(@Body() request: MemberRegisterRequest) {
    return this.memberService.register(request);
  }
}
