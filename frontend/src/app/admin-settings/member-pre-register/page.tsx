"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MemberPreRegisterPage } from "@/pages/member-pre-register-page";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";

export default function MemberPreRegisterRoutePage() {
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

  if (!isReady || !accessToken || !currentMember) {
    return null;
  }

  return (
    <MemberPreRegisterPage
      accessToken={accessToken}
      onBack={() => router.push("/admin-settings")}
    />
  );
}
