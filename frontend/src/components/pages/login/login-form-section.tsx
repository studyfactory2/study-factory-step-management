"use client";

import type { FormEvent } from "react";
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
  return (
    <section className="mt-0.5 rounded-[24px] border border-[#EBCDD1] bg-white/90 p-3 shadow-soft backdrop-blur ">
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2">
          <span className="text-[15px] font-black text-[#4B332E]">이름</span>
          <label className="flex min-h-[48px] w-full min-w-0 items-center gap-2.5 rounded-[16px] border border-[#EBCDD1] bg-white px-3 shadow-sm">
            <UserRound aria-hidden className="h-5 w-5 text-[#F188A4]" />
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
          <label className="flex min-h-[48px] w-full min-w-0 items-center gap-2 rounded-[16px] border border-[#EBCDD1] bg-white px-3 shadow-sm">
            <Lock aria-hidden className="h-5 w-5 text-[#F188A4]" />
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
              className="-mr-1 flex h-8 w-7 shrink-0 items-center justify-center text-[#BFA4A0] transition hover:text-[#F188A4]"
              onClick={onTogglePasswordVisible}
              type="button"
            >
              {isPasswordVisible ? (
                <Eye aria-hidden className="h-5 w-5" />
              ) : (
                <EyeOff aria-hidden className="h-5 w-5" />
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
          className="flex min-h-[50px] w-full items-center justify-center rounded-[16px] bg-[#F188A4] px-4 py-2.5 text-lg font-black text-white shadow-soft transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "로그인 중" : "로그인"}
        </button>

        <button
          className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-[16px] border border-[#EBCDD1] bg-[#FFF7F8] px-4 py-2 text-sm font-black text-[#E97999] transition hover:bg-[#FFF0F2]"
          type="button"
        >
          <UserPlus aria-hidden className="h-5 w-5" />
          홈화면에 추가하기
        </button>
      </form>
      <footer className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#FFF2F6] px-3 py-4 text-center text-[13px] font-black text-[#4B332E]">
        <Sparkles aria-hidden className="h-4 w-4 shrink-0 text-[#F188A4]" />
        당신은 우리 회사의 자랑스러운 인재!
      </footer>
    </section>
  );
}
