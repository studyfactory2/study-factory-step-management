"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrgChartSettingsPage } from "@/pages/org-chart-settings-page";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";

export default function OrgChartSettingsRoutePage() {
  const router = useRouter();
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

    setCurrentMember(auth.currentMember);
    setIsReady(true);
  }, [router]);

  if (!isReady || !currentMember) {
    return null;
  }

  return (
    <OrgChartSettingsPage
      onBack={() => router.push("/admin-settings")}
    />
  );
}
