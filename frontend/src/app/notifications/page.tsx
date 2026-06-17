"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, ClipboardList } from "lucide-react";
import { getNotifications, type NotificationItem } from "@/api/notification";
import { getStoredAuth, isAdminRole, type StoredMember } from "@/lib/auth-storage";
import { ResponsiveContainer } from "@/components/layout/responsive-container";

export default function NotificationsRoutePage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const auth = getStoredAuth();

    if (!auth.accessToken || !auth.currentMember) {
      router.replace("/");
      return;
    }

    setAccessToken(auth.accessToken);
    setCurrentMember(auth.currentMember);

    async function loadNotifications() {
      try {
        setIsLoading(true);
        setNotifications(await getNotifications(auth.accessToken));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "알림을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadNotifications();
  }, [router]);

  if (!currentMember || !accessToken) {
    return null;
  }

  const backPath = isAdminRole(currentMember.roleType) ? "/admin-dashboard" : "/employee-dashboard";

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <ResponsiveContainer className="pb-8" variant="detail">
        <header className="relative mb-4 pt-1 text-center">
          <button
            aria-label="뒤로가기"
            className="absolute left-0 top-0 flex h-7 min-w-7 items-center justify-center rounded-[9px] border border-[#D8D1CE] bg-white px-2.5 text-[13px] font-bold leading-none text-[#333333] shadow-sm sm:h-8 sm:min-w-8 sm:px-3 sm:text-[17px] md:h-9 md:min-w-9 md:text-[19px]"
            onClick={() => router.push(backPath)}
            type="button"
          >
            ←
          </button>
          <h1 className="flex items-center justify-center gap-1.5 text-[26px] font-normal leading-tight text-[#111111]">
            <Bell aria-hidden className="h-7 w-7 -translate-y-0.5 text-[#E30613]" />
            알림
          </h1>
          <p className="mt-0.5 text-[15px] font-normal text-[#77716E]">업무 소식을 모아봤어요</p>
        </header>

        {message ? (
          <div className="mb-3 rounded-[12px] border border-[#D8D1CE] bg-white px-3 py-2 text-center text-[14px] font-normal text-[#B94C4C]">
            {message}
          </div>
        ) : null}

        <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          {isLoading ? (
            <p className="py-8 text-center text-[15px] font-normal text-[#7B716D]">알림을 불러오는 중입니다.</p>
          ) : null}

          {!isLoading && notifications.length === 0 ? (
            <p className="py-8 text-center text-[15px] font-normal text-[#7B716D]">아직 알림이 없습니다.</p>
          ) : null}

          <div className="divide-y divide-[#ECE7E4]">
            {notifications.map((notification) => (
              <button
                className="grid w-full grid-cols-[34px_1fr] gap-2 py-3 text-left first:pt-0 last:pb-0"
                key={notification.id}
                onClick={() => router.push(`/tasks/${notification.task.id}?from=notifications`)}
                type="button"
              >
                <span className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                  notification.type === "TASK_ASSIGNED"
                    ? "bg-[#EAF4FF] text-[#2D70CB]"
                    : "bg-[#FFF1E8] text-[#B97A67]"
                }`}>
                  {notification.type === "TASK_ASSIGNED" ? (
                    <ClipboardList aria-hidden className="h-4 w-4" />
                  ) : (
                    <MessageCircle aria-hidden className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-[17px] font-normal text-[#111111]">{notification.task.title}</h2>
                  <p className="mt-1 break-keep text-[15px] font-normal leading-5 text-[#4F4542]">
                    {notification.type === "TASK_ASSIGNED"
                      ? `${notification.actor.name}님이 업무를 할당하셨습니다.`
                      : `${notification.actor.name}님이 코멘트를 작성하셨습니다.`}
                  </p>
                  {notification.type === "TASK_COMMENTED" && notification.commentPreview ? (
                    <p className="mt-1 truncate rounded-[10px] bg-[#F7F7F7] px-2 py-1 text-[14px] font-normal text-[#7B716D]">
                      {notification.commentPreview}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[13px] font-normal text-[#9B9592]">{formatNotificationDate(notification.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </ResponsiveContainer>
    </main>
  );
}

function formatNotificationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${month}.${day} ${hour}:${minute}`;
}
