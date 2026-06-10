"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AllTasksPage } from "@/pages/all-tasks-page";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";

export default function AllTasksRoutePage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const auth = getStoredAuth();

    if (!auth.accessToken || !auth.currentMember) {
      router.replace("/");
      return;
    }

    setAccessToken(auth.accessToken);
    setCurrentMember(auth.currentMember);
    setIsReady(true);
  }, [router]);

  if (!isReady || !accessToken || !currentMember) {
    return null;
  }

  return (
    <AllTasksPage
      accessToken={accessToken}
      currentMember={currentMember}
      onBack={() => router.push(isAdminRole(currentMember.roleType) ? "/admin-dashboard" : "/employee-dashboard")}
      onTaskDetailOpen={(taskId) => router.push(`/tasks/${taskId}`)}
    />
  );
}
