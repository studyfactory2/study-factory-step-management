import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { appConfig } from "./config/app.config";
import { databaseConfig } from "./config/database.config";
import { MemberModule } from "./member/member.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig]
    }),
    AuthModule,
    MemberModule
  ]
})
export class AppModule {}
