"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MemberManagementPage } from "@/pages/member-management-page";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";

export default function MemberManagementRoutePage() {
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

    setCurrentMember(auth.currentMember);
    setAccessToken(auth.accessToken);
    setIsReady(true);
  }, [router]);

  if (!isReady || !accessToken || !currentMember) {
    return null;
  }

  return (
    <MemberManagementPage
      accessToken={accessToken}
      currentMemberId={currentMember.id}
      onBack={() => router.push("/admin-settings")}
    />
  );
}
