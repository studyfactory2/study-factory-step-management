"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, UserPlus, UserRound } from "lucide-react";

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

function isIosInAppBrowser() {
  if (typeof window === "undefined" || !isIosDevice()) {
    return false;
  }

  return /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line/i.test(window.navigator.userAgent);
}

function isKakaoInAppBrowser() {
  if (typeof window === "undefined") {
    return false;
  }

  return /KAKAOTALK/i.test(window.navigator.userAgent);
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
  const [isSafariConfirmOpen, setIsSafariConfirmOpen] = useState(false);
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

    if (isIosInAppBrowser()) {
      setIsSafariConfirmOpen(true);
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

  function handleOpenSafariConfirm() {
    setIsSafariConfirmOpen(false);

    if (isKakaoInAppBrowser()) {
      const externalUrl = `kakaotalk://web/openExternal?url=${encodeURIComponent(window.location.href)}`;
      window.location.href = externalUrl;
      window.setTimeout(() => {
        setInstallMessage("Safari로 이동되지 않으면 카카오톡 우측 상단 메뉴에서 Safari로 열기를 선택해주세요.");
      }, 800);
      return;
    }

    setInstallMessage("현재 브라우저에서는 Safari 자동 이동이 제한됩니다. 우측 상단 메뉴에서 Safari로 열기를 선택해주세요.");
  }

  return (
    <section className="rounded-[16px] border border-[#D9D2CF] bg-white p-2.5 shadow-[0_2px_10px_rgba(95,73,68,0.08)] sm:p-3">
      <form className="space-y-2.5 sm:space-y-3" onSubmit={onSubmit}>
        <label className="flex min-h-[46px] w-full min-w-0 items-center gap-2 rounded-[8px] border border-[#D9D2CF] bg-white px-3 sm:min-h-[52px] sm:px-3.5">
          <UserRound aria-hidden className="h-5 w-5 text-[#7B716D]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] font-bold outline-none placeholder:text-[#B9B0AD] sm:text-[15px]"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="이름을 입력하세요"
              type="text"
              value={name}
            />
        </label>

        <label className="flex min-h-[46px] w-full min-w-0 items-center gap-2 rounded-[8px] border border-[#D9D2CF] bg-white px-3 sm:min-h-[52px] sm:px-3.5">
          <Lock aria-hidden className="h-5 w-5 text-[#7B716D]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] font-bold outline-none placeholder:text-[#B9B0AD] sm:text-[15px]"
              maxLength={4}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="비밀번호 (4자리)"
              type={isPasswordVisible ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
              className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center text-[#7B716D] transition hover:text-[#E30613]"
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

        <div className="flex items-center justify-between gap-3 px-1 text-[13px] font-bold text-[#4F4542] sm:text-[14px]">
          <label className="flex items-center gap-2">
            <input
              checked={rememberName}
              className="h-4.5 w-4.5 rounded border-[#D9D2CF] accent-[#E30613]"
              onChange={(event) => onRememberNameChange(event.target.checked)}
              type="checkbox"
            />
            이름 기억하기
          </label>
          <button
            className="text-[#4F4542] transition hover:text-[#E30613]"
            onClick={onOpenRegister}
            type="button"
          >
            직원등록 &gt;
          </button>
        </div>

        {message && (
          <p className="rounded-[10px] bg-[#FFF3F3] px-4 py-2.5 text-center text-sm font-black text-[#E30613]">
            {message}
          </p>
        )}

        <button
          className="flex min-h-[42px] w-full items-center justify-center rounded-[7px] bg-[#E30613] px-4 py-2 text-[15px] font-black text-white shadow-[0_3px_8px_rgba(227,6,19,0.2)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[48px] sm:text-[16px]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "로그인 중" : "로그인"}
        </button>

        <div className="border-y border-[#D9D2CF] py-2.5 text-center text-[13px] font-black text-[#4F4542] sm:py-3 sm:text-[14px]">
          당신은 우리 회사의 자랑스러운 인재!
        </div>

        <button
          className="flex min-h-[36px] w-full items-center justify-center gap-2 rounded-[8px] bg-white px-4 py-2 text-[13px] font-black text-[#4F4542] transition hover:bg-[#FFF3F3] sm:min-h-[42px] sm:text-[14px]"
          onClick={handleInstallClick}
          type="button"
        >
          <UserPlus aria-hidden className="h-4 w-4 text-[#E30613]" />
          홈화면에 추가하기
        </button>
        {installMessage && (
          <p className="text-center text-[11px] font-black text-[#E97999]">{installMessage}</p>
        )}
      </form>

      {isSafariConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F2C28]/25 px-5">
          <div className="w-full max-w-[320px] rounded-[24px] border border-[#EBCDD1] bg-[#FFFEFC] p-5 text-center shadow-soft">
            <h2 className="text-[17px] font-black text-[#3F2C28]">Safari로 이동하기</h2>
            <p className="mt-3 text-[12px] font-bold leading-5 text-[#8F7470]">
              iOS에서의 설치는 Safari에서만 가능합니다. Safari로 이동하시겠습니까?
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                className="h-10 rounded-full border border-[#EBCDD1] bg-white text-sm font-black text-[#9C7D79]"
                onClick={() => setIsSafariConfirmOpen(false)}
                type="button"
              >
                취소
              </button>
              <button
                className="h-10 rounded-full bg-primary text-sm font-black text-white"
                onClick={handleOpenSafariConfirm}
                type="button"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

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
