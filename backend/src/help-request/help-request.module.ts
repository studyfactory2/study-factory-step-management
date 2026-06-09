import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { Member } from "../member/entity/member.entity";
import { Task } from "../task/entity/task.entity";
import { UploadModule } from "../upload/upload.module";
import { HelpRequestAttachment } from "./entity/help-request-attachment.entity";
import { HelpRequest } from "./entity/help-request.entity";
import { HelpRequestController } from "./help-request.controller";
import { HelpRequestRepository } from "./help-request.repository";
import { HelpRequestService } from "./help-request.service";

@Module({
  imports: [TypeOrmModule.forFeature([HelpRequest, HelpRequestAttachment, Member, Task]), UploadModule],
  controllers: [HelpRequestController],
  providers: [HelpRequestService, HelpRequestRepository, JWTAuthGuard],
  exports: [HelpRequestService, HelpRequestRepository]
})
export class HelpRequestModule {}
