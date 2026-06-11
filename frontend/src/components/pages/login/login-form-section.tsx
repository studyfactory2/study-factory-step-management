"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  UserPlus,
  UserRound
} from "lucide-react";

type LoginFormSectionProps = {
  isPasswordVisible: boolean;
  isSubmitting: boolean;
  message: string;
  name: string;
  onNameChange: (value: string) => void;
  onOpenRegister: () => void;
  onPasswordChange: (value: string) => void;
  onRememberNameChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTogglePasswordVisible: () => void;
  password: string;
  rememberName: boolean;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

function isIosDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as NavigatorWithStandalone).standalone === true
  );
}

export function LoginFormSection({
  isPasswordVisible,
  isSubmitting,
  message,
  name,
  onNameChange,
  onOpenRegister,
  onPasswordChange,
  onRememberNameChange,
  onSubmit,
  onTogglePasswordVisible,
  password,
  rememberName
}: LoginFormSectionProps) {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installMessage, setInstallMessage] = useState("");
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    setIsAppInstalled(isStandaloneMode());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
      setInstallMessage("");
    }

    function handleAppInstalled() {
      setInstallPromptEvent(null);
      setIsAppInstalled(true);
      setInstallMessage("홈화면에 추가되었습니다.");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    setInstallMessage("");

    if (isAppInstalled) {
      setInstallMessage("이미 홈화면에서 앱처럼 실행 중입니다.");
      return;
    }

    if (installPromptEvent) {
      await installPromptEvent.prompt();
      const choice = await installPromptEvent.userChoice;

      if (choice.outcome === "accepted") {
        setInstallMessage("홈화면에 추가되었습니다.");
      } else {
        setInstallMessage("설치를 취소했습니다.");
      }

      setInstallPromptEvent(null);
      return;
    }

    setIsInstallGuideOpen(true);
  }

  return (
    <section className="mt-0.5 rounded-[24px] border border-[#EBCDD1] bg-white/90 p-3 shadow-soft backdrop-blur ">
      <form className="space-y-2.5" onSubmit={onSubmit}>
        <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2">
          <span className="text-[15px] font-black text-[#4B332E]">이름</span>
          <label className="flex min-h-[34px] w-full min-w-0 items-center gap-2 rounded-[13px] border border-[#EBCDD1] bg-white px-3 shadow-sm">
            <UserRound aria-hidden className="h-4 w-4 text-[#F188A4]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#C9ABA6]"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="이름을 입력하세요"
              type="text"
              value={name}
            />
          </label>
        </div>

        <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2">
          <span className="text-[15px] font-black text-[#4B332E]">비밀번호</span>
          <label className="flex min-h-[34px] w-full min-w-0 items-center gap-2 rounded-[13px] border border-[#EBCDD1] bg-white px-3 shadow-sm">
            <Lock aria-hidden className="h-4 w-4 text-[#F188A4]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#C9ABA6]"
              maxLength={4}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="4자리"
              type={isPasswordVisible ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
              className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center text-[#BFA4A0] transition hover:text-[#F188A4]"
              onClick={onTogglePasswordVisible}
              type="button"
            >
              {isPasswordVisible ? (
                <Eye aria-hidden className="h-4 w-4" />
              ) : (
                <EyeOff aria-hidden className="h-4 w-4" />
              )}
            </button>
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 px-1 text-sm font-bold text-[#9C7D79]">
          <label className="flex items-center gap-2">
            <input
              checked={rememberName}
              className="h-5 w-5 rounded border-[#EBCDD1] accent-[#F188A4]"
              onChange={(event) => onRememberNameChange(event.target.checked)}
              type="checkbox"
            />
            이름 기억하기
          </label>
          <button
            className="text-[#9C7D79] transition hover:text-[#F188A4]"
            onClick={onOpenRegister}
            type="button"
          >
            직원등록 &gt;
          </button>
        </div>

        {message && (
          <p className="rounded-[16px] bg-[#FFF3F5] px-4 py-2.5 text-center text-sm font-black text-[#E97999]">
            {message}
          </p>
        )}

        <button
          className="flex min-h-[44px] w-full items-center justify-center rounded-[15px] bg-[#F188A4] px-4 py-2 text-base font-black text-white shadow-soft transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "로그인 중" : "로그인"}
        </button>

        <div className="flex items-center justify-center gap-2 rounded-full bg-[#FFF2F6] px-3 py-2.5 text-center text-[12px] font-black text-[#4B332E]">
          <Sparkles aria-hidden className="h-3.5 w-3.5 shrink-0 text-[#F188A4]" />
          당신은 우리 회사의 자랑스러운 인재!
        </div>

        <button
          className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-[15px] bg-[#FFF7F8] px-4 py-2 text-sm font-black text-[#E97999] transition hover:bg-[#FFF0F2]"
          onClick={handleInstallClick}
          type="button"
        >
          <UserPlus aria-hidden className="h-4 w-4" />
          홈화면에 추가하기
        </button>
        {installMessage && (
          <p className="text-center text-[11px] font-black text-[#E97999]">{installMessage}</p>
        )}
      </form>

      {isInstallGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F2C28]/25 px-5">
          <div className="w-full max-w-[320px] rounded-[24px] border border-[#EBCDD1] bg-[#FFFEFC] p-5 text-center shadow-soft">
            <h2 className="text-[17px] font-black text-[#3F2C28]">홈화면에 추가하기</h2>
            <p className="mt-3 text-[12px] font-bold leading-5 text-[#8F7470]">
              {isIosDevice()
                ? "Safari 하단 공유 버튼을 누른 뒤 홈 화면에 추가를 선택해주세요."
                : "브라우저 메뉴에서 앱 설치 또는 홈 화면에 추가를 선택해주세요."}
            </p>
            <button
              className="mt-5 h-10 w-full rounded-full bg-primary text-sm font-black text-white"
              onClick={() => setIsInstallGuideOpen(false)}
              type="button"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
