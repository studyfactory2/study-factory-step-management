import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { MemberService } from "./member.service";

@Controller("members")
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  findAll() {
    return this.memberService.findAll();
  }

  @Get(":id")
  findById(@Param("id", ParseIntPipe) id: number) {
    return this.memberService.findById(id);
  }
}
