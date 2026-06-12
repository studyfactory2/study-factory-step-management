"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TaskCreatePage } from "@/pages/task-create-page";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";

export default function TaskCreateRoutePage() {
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

  const dashboardPath = isAdminRole(currentMember.roleType) ? "/admin-dashboard" : "/employee-dashboard";

  return (
    <TaskCreatePage
      accessToken={accessToken}
      onBack={() => router.push(dashboardPath)}
      onCreated={() => router.push(dashboardPath)}
    />
  );
}
