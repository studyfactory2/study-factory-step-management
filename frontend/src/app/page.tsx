"use client";

import { useEffect, useState } from "react";
import type { LoginResponse } from "@/api/auth";
import { AdminDashboardPage } from "@/pages/admin-dashboard-page";
import { LoginPage } from "@/pages/login-page";
import type { MemberRole } from "@/types/domain";

type StoredMember = {
  id: number;
  name: string;
  branch: string | null;
  roleType: MemberRole;
};

function parseStoredMember(value: string | null): StoredMember | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredMember;
  } catch {
    return null;
  }
}

function isAdminRole(roleType: MemberRole) {
  return roleType === "ADMIN" || roleType === "CEO";
}

export default function Home() {
  const [accessToken, setAccessToken] = useState("");
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken") ?? "");
    setCurrentMember(parseStoredMember(localStorage.getItem("currentMember")));
  }, []);

  function handleLogin(response: LoginResponse) {
    setAccessToken(response.accessToken);
    setCurrentMember(response.member);
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentMember");
    setAccessToken("");
    setCurrentMember(null);
  }

  if (accessToken && currentMember && isAdminRole(currentMember.roleType)) {
    return <AdminDashboardPage accessToken={accessToken} onLogout={handleLogout} />;
  }

  if (accessToken && currentMember) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-5">
        <section className="w-full max-w-[430px] rounded-[28px] border border-border bg-white/85 p-6 text-center shadow-soft">
          <p className="text-sm font-bold text-primary">{currentMember.name} 님</p>
          <h1 className="mt-3 text-2xl font-black text-foreground">직원 화면 준비중</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">
            관리자 대시보드는 대표와 관리자만 접근할 수 있습니다.
          </p>
          <button
            className="mt-6 h-12 w-full rounded-2xl bg-primary text-base font-black text-white"
            onClick={handleLogout}
            type="button"
          >
            로그아웃
          </button>
        </section>
      </main>
    );
  }

  return <LoginPage onLogin={handleLogin} />;
}
