import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { BoardModule } from "./board/board.module";
import { CacheModule } from "./cache/cache.module";
import { RefreshToken } from "./auth/entity/refresh-token.entity";
import { BoardCategory } from "./board/entity/board-category.entity";
import { BoardComment } from "./board/entity/board-comment.entity";
import { BoardLike } from "./board/entity/board-like.entity";
import { BoardPostAttachment } from "./board/entity/board-post-attachment.entity";
import { BoardPostCategory } from "./board/entity/board-post-category.entity";
import { BoardPost } from "./board/entity/board-post.entity";
import { BoardView } from "./board/entity/board-view.entity";
import { appConfig } from "./config/app.config";
import { databaseConfig } from "./config/database.config";
import { FavoriteMember } from "./favorite-member/entity/favorite-member.entity";
import { FavoriteMemberModule } from "./favorite-member/favorite-member.module";
import { jwtConfig } from "./config/jwt.config";
import { Member } from "./member/entity/member.entity";
import { MemberPreRegistration } from "./member/entity/member-pre-registration.entity";
import { OrganizationBranch } from "./member/entity/organization-branch.entity";
import { Organization } from "./member/entity/organization.entity";
import { MemberModule } from "./member/member.module";
import { Notification } from "./notification/entity/notification.entity";
import { NotificationModule } from "./notification/notification.module";
import { OrganizationChartNode } from "./organization-chart/entity/organization-chart-node.entity";
import { OrganizationChart } from "./organization-chart/entity/organization-chart.entity";
import { OrganizationChartModule } from "./organization-chart/organization-chart.module";
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
          BoardCategory,
          BoardComment,
          BoardLike,
          BoardPost,
          BoardPostAttachment,
          BoardPostCategory,
          BoardView,
          FavoriteMember,
          Member,
          MemberPreRegistration,
          Notification,
          Organization,
          OrganizationBranch,
          OrganizationChart,
          OrganizationChartNode,
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
    BoardModule,
    CacheModule,
    FavoriteMemberModule,
    MemberModule,
    NotificationModule,
    OrganizationChartModule,
    PositionModule,
    TaskCommentModule,
    TaskModule
  ]
})
export class AppModule {}
