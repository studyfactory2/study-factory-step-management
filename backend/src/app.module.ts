import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { RefreshToken } from "./auth/entity/refresh-token.entity";
import { appConfig } from "./config/app.config";
import { databaseConfig } from "./config/database.config";
import { FavoriteMember } from "./favorite-member/entity/favorite-member.entity";
import { FavoriteMemberModule } from "./favorite-member/favorite-member.module";
import { HelpRequestAttachment } from "./help-request/entity/help-request-attachment.entity";
import { HelpRequest } from "./help-request/entity/help-request.entity";
import { HelpRequestModule } from "./help-request/help-request.module";
import { jwtConfig } from "./config/jwt.config";
import { Member } from "./member/entity/member.entity";
import { MemberPreRegistration } from "./member/entity/member-pre-registration.entity";
import { OrganizationBranch } from "./member/entity/organization-branch.entity";
import { Organization } from "./member/entity/organization.entity";
import { MemberModule } from "./member/member.module";
import { PositionDuty } from "./position/entity/position-duty.entity";
import { Position } from "./position/entity/position.entity";
import { PositionModule } from "./position/position.module";
import { TaskCommentAttachment } from "./task-comment/entity/task-comment-attachment.entity";
import { TaskComment } from "./task-comment/entity/task-comment.entity";
import { TaskCommentModule } from "./task-comment/task-comment.module";
import { TaskAttachment } from "./task/entity/task-attachment.entity";
import { TaskReadStatus } from "./task/entity/task-read-status.entity";
import { Task } from "./task/entity/task.entity";
import { TaskModule } from "./task/task.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.getOrThrow<string>("database.url"),
        entities: [
          FavoriteMember,
          HelpRequest,
          HelpRequestAttachment,
          Member,
          MemberPreRegistration,
          Organization,
          OrganizationBranch,
          RefreshToken,
          Position,
          PositionDuty,
          Task,
          TaskAttachment,
          TaskReadStatus,
          TaskComment,
          TaskCommentAttachment
        ],
        synchronize: false
      })
    }),
    AdminModule,
    AuthModule,
    FavoriteMemberModule,
    HelpRequestModule,
    MemberModule,
    PositionModule,
    TaskCommentModule,
    TaskModule
  ]
})
export class AppModule {}
