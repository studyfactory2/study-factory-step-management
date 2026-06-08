import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { FavoriteMemberCreateRequest } from "./dto/favorite-member-create.request";
import { FavoriteMemberService } from "./favorite-member.service";

@Controller("favorite-members")
@UseGuards(JWTAuthGuard)
export class FavoriteMemberController {
  constructor(private readonly favoriteMemberService: FavoriteMemberService) {}

  @Post()
  async addFavoriteMember(
    @CurrentMember() currentMember: CurrentMemberType,
    @Body() request: FavoriteMemberCreateRequest
  ) {
    return this.favoriteMemberService.addFavoriteMember(currentMember.memberId, request.memberId);
  }

  @Delete(":memberId")
  async deleteFavoriteMember(
    @CurrentMember() currentMember: CurrentMemberType,
    @Param("memberId", ParseIntPipe) memberId: number
  ) {
    return this.favoriteMemberService.deleteFavoriteMember(currentMember.memberId, memberId);
  }

  @Get("candidates")
  async getCandidateMembers(@CurrentMember() currentMember: CurrentMemberType) {
    return this.favoriteMemberService.getCandidateMembers(currentMember.memberId);
  }

  @Get("me")
  async getFavoriteMembers(@CurrentMember() currentMember: CurrentMemberType) {
    return this.favoriteMemberService.getFavoriteMembers(currentMember.memberId);
  }
}
