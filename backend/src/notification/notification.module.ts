import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { Notification } from "./entity/notification.entity";
import { NotificationController } from "./notification.controller";
import { NotificationGateway } from "./notification.gateway";
import { NotificationRepository } from "./notification.repository";
import { NotificationService } from "./notification.service";

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository, NotificationGateway, JWTAuthGuard],
  exports: [NotificationService]
})
export class NotificationModule {}
