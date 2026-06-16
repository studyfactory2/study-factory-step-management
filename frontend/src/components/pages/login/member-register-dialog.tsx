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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F2C28]/35 px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[calc(100dvh-48px)] w-full max-w-[324px] overflow-y-auto rounded-[24px] border border-[#EBCDD1] bg-[#FFFEFC] p-4 shadow-[0_18px_60px_rgba(111,74,71,0.24)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[21px] font-black tracking-normal text-[#3F2C28]">직원 등록</h2>
            <p className="mt-1 text-xs font-bold leading-5 text-[#9C7D79]">
              사전등록된 이름과 사용할 비밀번호를 입력해주세요.
            </p>
          </div>
          <button
            aria-label="직원 등록 닫기"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF1F6] text-[#F188A4] transition hover:brightness-95"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-4 space-y-2.5" onSubmit={handleRegisterSubmit}>
          <input
            className="h-11 w-full rounded-[15px] border border-[#EBCDD1] bg-white px-3 text-sm font-bold text-[#4B332E] outline-none placeholder:text-[#C9ABA6]"
            onChange={(event) => setRegisterName(event.target.value)}
            placeholder="이름"
            required
            type="text"
            value={registerName}
          />
          <input
            className="h-11 w-full rounded-[15px] border border-[#EBCDD1] bg-white px-3 text-sm font-bold text-[#4B332E] outline-none placeholder:text-[#C9ABA6]"
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
            <p className="rounded-[15px] bg-[#FFF3F5] px-3 py-2.5 text-center text-xs font-black text-[#E97999]">
              {message}
            </p>
          )}

          <button
            className="flex h-11 w-full items-center justify-center rounded-[15px] bg-[#F188A4] px-4 text-sm font-black text-white shadow-soft transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
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
