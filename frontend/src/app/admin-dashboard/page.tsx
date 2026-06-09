"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminDashboardPage } from "@/pages/admin-dashboard-page";
import {
  clearAuth,
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";

export default function AdminDashboardRoutePage() {
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

    if (!isAdminRole(auth.currentMember.roleType)) {
      router.replace("/employee-dashboard");
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
    <AdminDashboardPage
      accessToken={accessToken}
      onLogout={handleLogout}
      onTaskDetailOpen={(taskId) => router.push(`/tasks/${taskId}`)}
    />
  );
}
