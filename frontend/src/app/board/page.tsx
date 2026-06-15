"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";

export default function BoardRoutePage() {
  const router = useRouter();
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const auth = getStoredAuth();

    if (!auth.accessToken || !auth.currentMember) {
      router.replace("/");
      return;
    }

    setCurrentMember(auth.currentMember);
    setIsReady(true);
  }, [router]);

  if (!isReady || !currentMember) {
    return null;
  }

  const backPath = isAdminRole(currentMember.roleType) ? "/admin-dashboard" : "/employee-dashboard";

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="mx-auto w-full max-w-[360px] space-y-4">
        <header className="relative pb-1 text-center">
          <button
            className="absolute left-0 top-0 h-8 rounded-[12px] border border-[#D8D1CE] bg-[#F7F7F7] px-3 text-[12px] font-normal text-[#333333] shadow-sm"
            onClick={() => router.push(backPath)}
            type="button"
          >
            ← 뒤로가기
          </button>
          <h1 className="flex items-center justify-center gap-2 text-[24px] font-normal text-[#111111]">
            <ClipboardList aria-hidden className="h-6 w-6 text-[#4F4542]" />
            사내게시판
          </h1>
        </header>
        <section className="rounded-[18px] border border-[#D8D1CE] bg-white p-6 text-center text-[14px] font-normal text-[#7B716D] shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          게시판 화면을 준비하고 있습니다.
        </section>
      </div>
    </main>
  );
}
