import { NotificationType } from "../enum/notification-type.enum";

export class NotificationActorResponse {
  id: number;
  name: string;
}

export class NotificationTaskResponse {
  id: number;
  title: string;
}

export class NotificationResponse {
  id: number;
  type: NotificationType;
  task: NotificationTaskResponse;
  actor: NotificationActorResponse;
  commentPreview: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export class NotificationUnreadCountResponse {
  unreadCount: number;
}
