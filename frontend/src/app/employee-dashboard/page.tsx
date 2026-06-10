"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EmployeeDashboardPage } from "@/pages/employee-dashboard-page";
import {
  clearAuth,
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";

export default function EmployeeDashboardRoutePage() {
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

    if (isAdminRole(auth.currentMember.roleType)) {
      router.replace("/admin-dashboard");
      return;
    }

    setAccessToken(auth.accessToken);
    setCurrentMember(auth.currentMember);
    setIsReady(true);
  }, [router]);

  function handleLogout() {
    clearAuth();
    router.replace("/");
  }

  if (!isReady || !accessToken || !currentMember) {
    return null;
  }

  return (
    <EmployeeDashboardPage
      accessToken={accessToken}
      currentMember={currentMember}
      onAllTasksOpen={() => router.push("/tasks")}
      onLogout={handleLogout}
      onTaskDetailOpen={(taskId) => router.push(`/tasks/${taskId}`)}
    />
  );
}
