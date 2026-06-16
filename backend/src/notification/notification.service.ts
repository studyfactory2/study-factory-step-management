import { Injectable } from "@nestjs/common";
import { CurrentMember } from "../auth/type/current-member.type";
import { Task } from "../task/entity/task.entity";
import { NotificationResponse, NotificationUnreadCountResponse } from "./dto/notification.response";
import { Notification } from "./entity/notification.entity";
import { NotificationType } from "./enum/notification-type.enum";
import { NotificationGateway } from "./notification.gateway";
import { NotificationRepository } from "./notification.repository";

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway
  ) {}

  async createTaskAssignedNotifications(tasks: Task[], actorId: number): Promise<void> {
    const notifications = tasks
      .filter((task) => task.assigneeId !== actorId)
      .map((task) => this.createNotification({
        actorId,
        recipientId: task.assigneeId,
        taskId: task.id,
        type: NotificationType.TASK_ASSIGNED
      }));

    const savedNotifications = await this.notificationRepository.saveAll(notifications);
    this.emitRealtimeNotifications(savedNotifications);
  }

  async createTaskCommentNotifications(
    task: Task,
    actorId: number,
    commentPreview: string
  ): Promise<void> {
    const recipientIds = Array.from(new Set([task.createdBy, task.assigneeId]))
      .filter((recipientId) => recipientId !== actorId);
    const notifications = recipientIds.map((recipientId) => this.createNotification({
      actorId,
      commentPreview: this.truncateCommentPreview(commentPreview),
      recipientId,
      taskId: task.id,
      type: NotificationType.TASK_COMMENTED
    }));

    const savedNotifications = await this.notificationRepository.saveAll(notifications);
    this.emitRealtimeNotifications(savedNotifications);
  }

  async findMyNotifications(currentMember: CurrentMember): Promise<NotificationResponse[]> {
    const notifications = await this.notificationRepository.findByRecipientId(currentMember.memberId);
    return notifications.map((notification) => this.toResponse(notification));
  }

  async getUnreadCount(currentMember: CurrentMember): Promise<NotificationUnreadCountResponse> {
    return {
      unreadCount: await this.notificationRepository.countUnreadByRecipientId(currentMember.memberId)
    };
  }

  async markAllAsRead(currentMember: CurrentMember): Promise<NotificationUnreadCountResponse> {
    await this.notificationRepository.markAllAsRead(currentMember.memberId);
    return {
      unreadCount: 0
    };
  }

  async markTaskNotificationsAsRead(taskId: number, currentMember: CurrentMember): Promise<void> {
    await this.notificationRepository.markTaskNotificationsAsRead(currentMember.memberId, taskId);
  }

  private createNotification(request: {
    actorId: number;
    commentPreview?: string | null;
    recipientId: number;
    taskId: number;
    type: NotificationType;
  }): Notification {
    const notification = new Notification();
    notification.actorId = request.actorId;
    notification.commentPreview = request.commentPreview ?? null;
    notification.isRead = false;
    notification.readAt = null;
    notification.recipientId = request.recipientId;
    notification.taskId = request.taskId;
    notification.type = request.type;

    return notification;
  }

  private truncateCommentPreview(content: string): string {
    return content.trim().slice(0, 80);
  }

  private emitRealtimeNotifications(notifications: Notification[]): void {
    notifications.forEach((notification) => {
      this.notificationGateway.notifyMember(notification.recipientId, {
        actorId: notification.actorId,
        commentPreview: notification.commentPreview,
        id: notification.id,
        taskId: notification.taskId,
        type: notification.type,
        unreadIncrement: notification.isRead ? 0 : 1
      });
    });
  }

  private toResponse(notification: Notification): NotificationResponse {
    return {
      id: notification.id,
      type: notification.type,
      task: {
        id: notification.task.id,
        title: notification.task.title
      },
      actor: {
        id: notification.actor.id,
        name: notification.actor.displayName ?? notification.actor.name
      },
      commentPreview: notification.commentPreview,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString() ?? null
    };
  }
}
