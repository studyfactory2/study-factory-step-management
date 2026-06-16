import { useEffect } from "react";
import { io } from "socket.io-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export type RealtimeNotificationPayload = {
  actorId: number;
  commentPreview: string | null;
  id: number;
  taskId: number;
  type: "TASK_ASSIGNED" | "TASK_COMMENTED";
  unreadIncrement: number;
};

export function useRealtimeNotifications(
  accessToken: string | undefined,
  onNotification: (notification: RealtimeNotificationPayload) => void
) {
  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = io(`${API_BASE_URL}/notifications`, {
      auth: {
        token: accessToken
      },
      transports: ["websocket"]
    });

    socket.on("notification:new", onNotification);

    return () => {
      socket.off("notification:new", onNotification);
      socket.disconnect();
    };
  }, [accessToken, onNotification]);
}
