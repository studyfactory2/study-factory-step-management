import { handleUnauthorizedResponse } from "@/api/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type NotificationType = "TASK_ASSIGNED" | "TASK_COMMENTED";

export type NotificationItem = {
  id: number;
  type: NotificationType;
  task: {
    id: number;
    title: string;
  };
  actor: {
    id: number;
    name: string;
  };
  commentPreview: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

export type NotificationUnreadCount = {
  unreadCount: number;
};

export async function getNotifications(accessToken: string): Promise<NotificationItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/notifications`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("알림 목록을 불러오지 못했습니다.");
  }

  return response.json() as Promise<NotificationItem[]>;
}

export async function getNotificationUnreadCount(accessToken: string): Promise<NotificationUnreadCount> {
  const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("알림 개수를 불러오지 못했습니다.");
  }

  return response.json() as Promise<NotificationUnreadCount>;
}

export async function markAllNotificationsAsRead(accessToken: string): Promise<NotificationUnreadCount> {
  const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  handleUnauthorizedResponse(response);

  if (!response.ok) {
    throw new Error("알림을 읽음 처리하지 못했습니다.");
  }

  return response.json() as Promise<NotificationUnreadCount>;
}
