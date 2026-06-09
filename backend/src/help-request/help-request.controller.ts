import { Body, Controller, Get, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { UploadFile } from "../upload/type/upload-file.type";
import { HelpRequestCreateRequest } from "./dto/help-request-create.request";
import { HelpRequestService } from "./help-request.service";

@Controller("help-requests")
export class HelpRequestController {
  constructor(private readonly helpRequestService: HelpRequestService) {}

  @UseGuards(JWTAuthGuard)
  @Get("received")
  async findReceived(@CurrentMember() currentMember: CurrentMemberType) {
    return this.helpRequestService.findReceived(currentMember);
  }

  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FilesInterceptor("attachments", 10))
  @Post()
  async create(
    @Body() request: HelpRequestCreateRequest,
    @CurrentMember() currentMember: CurrentMemberType,
    @UploadedFiles() files: UploadFile[] = []
  ) {
    return this.helpRequestService.create(request, currentMember, files);
  }
}
