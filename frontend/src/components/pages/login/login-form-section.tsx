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

  return /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line/i.test(
    window.navigator.userAgent,
  );
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
  rememberName,
}: LoginFormSectionProps) {
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
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
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
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
        setInstallMessage(
          "Safari로 이동되지 않으면 카카오톡 우측 상단 메뉴에서 Safari로 열기를 선택해주세요.",
        );
      }, 800);
      return;
    }

    setInstallMessage(
      "현재 브라우저에서는 Safari 자동 이동이 제한됩니다. 우측 상단 메뉴에서 Safari로 열기를 선택해주세요.",
    );
  }

  return (
    <section className="surface-card p-3">
      <div className="mb-3">
        <h2 className="text-lg font-extrabold tracking-[-0.04em] text-[#191f28]">
          로그인
        </h2>
      </div>
      <form className="space-y-2.5" onSubmit={onSubmit}>
        <label className="flex min-h-[48px] w-full min-w-0 items-center gap-2.5 rounded-[13px] border border-[#e5e8eb] bg-[#f9fafb] px-3.5 transition focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-[#3182f6]/10">
          <UserRound aria-hidden className="h-5 w-5 text-[#8b95a1]" />
          <input
            aria-label="이름"
            autoComplete="username"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#191f28] outline-none placeholder:font-medium placeholder:text-[#b0b8c1]"
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="이름을 입력하세요"
            type="text"
            value={name}
          />
        </label>

        <label className="flex min-h-[48px] w-full min-w-0 items-center gap-2.5 rounded-[13px] border border-[#e5e8eb] bg-[#f9fafb] px-3.5 transition focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-[#3182f6]/10">
          <Lock aria-hidden className="h-5 w-5 text-[#8b95a1]" />
          <input
            aria-label="비밀번호"
            autoComplete="current-password"
            inputMode="numeric"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#191f28] outline-none placeholder:font-medium placeholder:text-[#b0b8c1]"
            maxLength={4}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="비밀번호 (4자리)"
            type={isPasswordVisible ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[#8b95a1] transition hover:bg-[#f2f4f6] hover:text-[#333d4b]"
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

        <div className="flex items-center justify-between gap-2 px-1 text-xs font-semibold text-[#6b7684]">
          <label className="flex items-center gap-2">
            <input
              checked={rememberName}
              className="h-[18px] w-[18px] rounded border-[#d1d6db] accent-[#3182f6]"
              onChange={(event) => onRememberNameChange(event.target.checked)}
              type="checkbox"
            />
            이름 기억하기
          </label>
          <button
            className="text-primary transition hover:text-[#1b64da]"
            onClick={onOpenRegister}
            type="button"
          >
            처음이신가요? 직원등록
          </button>
        </div>

        {message && (
          <p
            className="rounded-[14px] bg-[#fff0f1] px-4 py-3 text-center text-sm font-semibold text-[#e42939]"
            role="alert"
          >
            {message}
          </p>
        )}

        <button
          className="flex min-h-[48px] w-full items-center justify-center rounded-[13px] bg-primary px-5 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(49,130,246,0.22)] transition hover:bg-[#1b64da] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "로그인 중" : "로그인"}
        </button>

        <button
          className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#f2f4f6] px-4 text-xs font-semibold text-[#4e5968] transition hover:bg-[#e5e8eb]"
          onClick={handleInstallClick}
          type="button"
        >
          <UserPlus aria-hidden className="h-4 w-4 text-[#3182f6]" />
          홈화면에 추가하기
        </button>
        {installMessage && (
          <p className="text-center text-xs font-medium text-[#6b7684]">
            {installMessage}
          </p>
        )}
      </form>

      {isSafariConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191f28]/40 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[340px] rounded-[24px] bg-white p-6 text-center shadow-soft">
            <h2 className="text-lg font-bold text-[#191f28]">
              Safari로 이동하기
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-[#6b7684]">
              iOS에서의 설치는 Safari에서만 가능합니다. Safari로
              이동하시겠습니까?
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                className="h-12 rounded-[14px] bg-[#f2f4f6] text-sm font-semibold text-[#4e5968]"
                onClick={() => setIsSafariConfirmOpen(false)}
                type="button"
              >
                취소
              </button>
              <button
                className="h-12 rounded-[14px] bg-primary text-sm font-bold text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191f28]/40 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[340px] rounded-[24px] bg-white p-6 text-center shadow-soft">
            <h2 className="text-lg font-bold text-[#191f28]">
              홈화면에 추가하기
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-[#6b7684]">
              {isIosDevice()
                ? "Safari 하단 공유 버튼을 누른 뒤 홈 화면에 추가를 선택해주세요."
                : "브라우저 메뉴에서 앱 설치 또는 홈 화면에 추가를 선택해주세요."}
            </p>
            <button
              className="mt-5 h-12 w-full rounded-[14px] bg-primary text-sm font-bold text-white"
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
