"use client";

import { type FormEvent, useState } from "react";
import { X } from "lucide-react";
import { registerMember } from "@/api/member";

export function MemberRegisterDialog({ onClose }: { onClose: () => void }) {
  const [registerName, setRegisterName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      await registerMember({
        name: registerName,
        password: registerPassword
      });
      setMessage("직원 등록이 완료되었습니다. 로그인해주세요.");
      setRegisterName("");
      setRegisterPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "직원 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2F3A43]/30 px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[calc(100dvh-48px)] w-full max-w-[324px] overflow-y-auto rounded-[18px] border border-[#D8D1CE] bg-[#FFFEFC] p-4 shadow-[0_18px_48px_rgba(65,52,48,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-normal tracking-normal text-[#222222]">직원 등록</h2>
            <p className="mt-1 text-[12px] font-normal leading-5 text-[#7B716D]">
              사전등록된 이름과 사용할 비밀번호를 입력해주세요.
            </p>
          </div>
          <button
            aria-label="직원 등록 닫기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#D8D1CE] bg-white text-[#4F4542] shadow-sm transition hover:bg-[#F7F7F7]"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-4 space-y-2.5" onSubmit={handleRegisterSubmit}>
          <input
            className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-white px-3 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A] focus:border-[#9DC7ED] focus:bg-[#F4FAFF] focus:shadow-[0_0_0_3px_rgba(157,199,237,0.22)]"
            onChange={(event) => setRegisterName(event.target.value)}
            placeholder="이름"
            required
            type="text"
            value={registerName}
          />
          <input
            className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-white px-3 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A] focus:border-[#9DC7ED] focus:bg-[#F4FAFF] focus:shadow-[0_0_0_3px_rgba(157,199,237,0.22)]"
            inputMode="numeric"
            maxLength={4}
            minLength={4}
            onChange={(event) => setRegisterPassword(event.target.value)}
            placeholder="비밀번호 4자리"
            required
            type="password"
            value={registerPassword}
          />

          {message && (
            <p className="rounded-[10px] border border-[#B9D7EF] bg-[#F3FAFF] px-3 py-2.5 text-center text-[12px] font-normal text-[#416A83]">
              {message}
            </p>
          )}

          <button
            className="flex h-10 w-full items-center justify-center rounded-[10px] border border-[#B9D7EF] bg-[#D8ECFF] px-4 text-[13px] font-normal text-[#2D70CB] shadow-sm transition hover:bg-[#CFE7FF] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "등록 중" : "직원 등록"}
          </button>
        </form>
      </section>
    </div>
  );
}
