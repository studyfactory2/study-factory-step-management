"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TaskDetailPage } from "@/pages/task-detail-page";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";

type TaskDetailRoutePageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default function TaskDetailRoutePage({ params }: TaskDetailRoutePageProps) {
  const { taskId } = use(params);
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);
  const [isReady, setIsReady] = useState(false);
  const parsedTaskId = Number(taskId);

  useEffect(() => {
    const auth = getStoredAuth();

    if (!Number.isFinite(parsedTaskId)) {
      router.replace("/admin-dashboard");
      return;
    }

    if (!auth.accessToken || !auth.currentMember) {
      router.replace("/");
      return;
    }

    setAccessToken(auth.accessToken);
    setCurrentMember(auth.currentMember);
    setIsReady(true);
  }, [parsedTaskId, router]);

  if (!isReady || !accessToken || !currentMember) {
    return null;
  }

  return (
    <TaskDetailPage
      accessToken={accessToken}
      onBack={() => router.push(isAdminRole(currentMember.roleType) ? "/admin-dashboard" : "/employee-dashboard")}
      taskId={parsedTaskId}
    />
  );
}
