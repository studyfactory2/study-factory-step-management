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
import { jwtConfig } from "./config/jwt.config";
import { Member } from "./member/entity/member.entity";
import { MemberPreRegistration } from "./member/entity/member-pre-registration.entity";
import { MemberModule } from "./member/member.module";
import { PositionDuty } from "./position/entity/position-duty.entity";
import { Position } from "./position/entity/position.entity";
import { PositionModule } from "./position/position.module";
import { TaskAttachment } from "./task/entity/task-attachment.entity";
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
          Member,
          MemberPreRegistration,
          RefreshToken,
          Position,
          PositionDuty,
          Task,
          TaskAttachment
        ],
        synchronize: false
      })
    }),
    AdminModule,
    AuthModule,
    FavoriteMemberModule,
    MemberModule,
    PositionModule,
    TaskModule
  ]
})
export class AppModule {}
