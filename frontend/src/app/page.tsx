"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LoginResponse } from "@/api/auth";
import { LoginPage } from "@/pages/login-page";
import { getStoredAuth, isAdminRole } from "@/lib/auth-storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { accessToken, currentMember } = getStoredAuth();

    if (!accessToken || !currentMember) {
      return;
    }

    if (isAdminRole(currentMember.roleType)) {
      router.replace("/admin-dashboard");
      return;
    }
  }, [router]);

  function handleLogin(response: LoginResponse) {
    if (isAdminRole(response.member.roleType)) {
      router.replace("/admin-dashboard");
      return;
    }

    router.replace("/employee-dashboard");
  }

  return <LoginPage onLogin={handleLogin} />;
}
