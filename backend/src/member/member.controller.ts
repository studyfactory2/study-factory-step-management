import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { MemberPreRegisterRequest } from "./dto/member-pre-register.request";
import { MemberRegisterRequest } from "./dto/member-register.request";
import { MemberService } from "./member.service";

@Controller("members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  async findAll() {
    return this.memberService.findAll();
  }

  @Get(":id")
  async findById(@Param("id", ParseIntPipe) id: number) {
    return this.memberService.findById(id);
  }

  @Post("pre-registrations")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async preRegister(@Body() request: MemberPreRegisterRequest) {
    return this.memberService.preRegister(request);
  }

  @Post("register")
  async register(@Body() request: MemberRegisterRequest) {
    return this.memberService.register(request);
  }
}
