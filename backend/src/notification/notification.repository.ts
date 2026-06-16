import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "./entity/notification.entity";

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
  ) {}

  async saveAll(notifications: Notification[]): Promise<Notification[]> {
    if (notifications.length === 0) {
      return [];
    }

    return this.notificationRepository.save(notifications);
  }

  async findByRecipientId(recipientId: number): Promise<Notification[]> {
    return this.notificationRepository
      .createQueryBuilder("notification")
      .leftJoinAndSelect("notification.task", "task")
      .leftJoinAndSelect("notification.actor", "actor")
      .where("notification.recipientId = :recipientId", { recipientId })
      .orderBy("notification.createdAt", "DESC")
      .limit(100)
      .getMany();
  }

  async countUnreadByRecipientId(recipientId: number): Promise<number> {
    return this.notificationRepository.count({
      where: {
        recipientId,
        isRead: false
      }
    });
  }

  async markAllAsRead(recipientId: number, readAt = new Date()): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        isRead: true,
        readAt
      })
      .where("recipient_id = :recipientId", { recipientId })
      .andWhere("is_read = false")
      .execute();
  }

  async markTaskNotificationsAsRead(
    recipientId: number,
    taskId: number,
    readAt = new Date()
  ): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        isRead: true,
        readAt
      })
      .where("recipient_id = :recipientId", { recipientId })
      .andWhere("task_id = :taskId", { taskId })
      .andWhere("is_read = false")
      .execute();
  }
}
