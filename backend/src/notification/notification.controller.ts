import { Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { CurrentMember } from "../auth/decorator/current-member.decorator";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { CurrentMember as CurrentMemberType } from "../auth/type/current-member.type";
import { NotificationService } from "./notification.service";

@UseGuards(JWTAuthGuard)
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findMyNotifications(@CurrentMember() currentMember: CurrentMemberType) {
    return this.notificationService.findMyNotifications(currentMember);
  }

  @Get("unread-count")
  async getUnreadCount(@CurrentMember() currentMember: CurrentMemberType) {
    return this.notificationService.getUnreadCount(currentMember);
  }

  @Patch("read-all")
  async markAllAsRead(@CurrentMember() currentMember: CurrentMemberType) {
    return this.notificationService.markAllAsRead(currentMember);
  }
}
