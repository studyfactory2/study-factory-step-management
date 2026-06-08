import { FormEvent, useState } from "react";
import type { MemberPreRegistration } from "@/api/member";
import type { MemberAffiliation, MemberDuty, MemberPosition } from "@/types/domain";
import { affiliationLabels, dutyLabels, positionLabels } from "./constants";

type MemberPreRegisterPanelProps = {
  isLoading?: boolean;
  isSubmitting: boolean;
  layout?: "page" | "modal";
  preRegistrations?: MemberPreRegistration[];
  onClose: () => void;
  onDelete?: (id: number, name: string) => void;
  onSubmit: (request: {
    affiliation: MemberAffiliation;
    branch: string;
    duty: MemberDuty;
    name: string;
    position: MemberPosition;
  }) => Promise<void>;
};

const affiliationOptions: MemberAffiliation[] = ["DEVELOPMENT_TEAM", "STAFF"];

const positionOptionsByAffiliation: Record<MemberAffiliation, MemberPosition[]> = {
  ADMIN: [],
  CEO: [],
  DEVELOPMENT_TEAM: ["DEVELOPMENT_LEAD", "DEVELOPER"],
  STAFF: ["STAFF", "EMPLOYEE", "OPERATIONS_MANAGER"]
};

const dutyOptionsByPosition: Record<MemberPosition, MemberDuty[]> = {
  ADMIN: [],
  CEO: [],
  DEVELOPER: ["DEVELOPMENT"],
  DEVELOPMENT_LEAD: ["DEVELOPMENT"],
  EMPLOYEE: ["CLEANING", "FOOD", "BEVERAGE"],
  OPERATIONS_MANAGER: ["GENERAL"],
  STAFF: ["CLEANING", "FOOD", "BEVERAGE"]
};

export function MemberPreRegisterPanel({
  isLoading = false,
  isSubmitting,
  layout = "page",
  preRegistrations = [],
  onClose,
  onDelete,
  onSubmit
}: MemberPreRegisterPanelProps) {
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [affiliation, setAffiliation] = useState<MemberAffiliation | "">("");
  const [position, setPosition] = useState<MemberPosition | "">("");
  const [duty, setDuty] = useState<MemberDuty | "">("");
  const positionOptions = affiliation ? positionOptionsByAffiliation[affiliation] : [];
  const dutyOptions = position ? dutyOptionsByPosition[position] : [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!affiliation || !position || !duty) {
      return;
    }

    await onSubmit({
      affiliation,
      branch,
      duty,
      name,
      position
    });
    setName("");
    setBranch("");
    setAffiliation("");
    setPosition("");
    setDuty("");
  }

  function handleAffiliationChange(value: string) {
    setAffiliation(value as MemberAffiliation | "");
    setPosition("");
    setDuty("");
  }

  function handlePositionChange(value: string) {
    setPosition(value as MemberPosition | "");
    setDuty("");
  }

  return (
    <section
      className={
        layout === "modal"
          ? "rounded-[22px] border border-[#F2C9C2] bg-[#FFF8F9] px-6 py-6"
          : "rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]"
      }
    >
      <div className="flex items-center justify-between gap-5">
        <h2 className="text-2xl font-semibold text-[#5A3E3B]">사전 직원 등록</h2>
        <button
          className="h-9 rounded-full border-2 border-primary bg-white px-6 text-sm font-semibold text-primary"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
      </div>
      <form
        className={
          layout === "modal"
            ? "mt-7 grid gap-4 sm:grid-cols-2"
            : "mt-7 grid gap-5 lg:grid-cols-[1fr_1fr_180px_180px_180px_auto]"
        }
        onSubmit={handleSubmit}
      >
        <input
          className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium outline-none placeholder:text-[#B79A94]"
          onChange={(event) => setName(event.target.value)}
          placeholder="이름"
          required
          value={name}
        />
        <input
          className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium outline-none placeholder:text-[#B79A94]"
          onChange={(event) => setBranch(event.target.value)}
          placeholder="지점"
          required
          value={branch}
        />
        <select
          className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium text-[#B79A94] outline-none"
          onChange={(event) => handleAffiliationChange(event.target.value)}
          required
          value={affiliation}
        >
          <option value="">소속</option>
          {affiliationOptions.map((option) => (
            <option key={option} value={option}>
              {affiliationLabels[option]}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium text-[#B79A94] outline-none"
          disabled={!affiliation}
          onChange={(event) => handlePositionChange(event.target.value)}
          required
          value={position}
        >
          <option value="">직급</option>
          {positionOptions.map((option) => (
            <option key={option} value={option}>
              {positionLabels[option]}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium text-[#B79A94] outline-none"
          disabled={!position}
          onChange={(event) => setDuty(event.target.value as MemberDuty)}
          required
          value={duty}
        >
          <option value="">역할</option>
          {dutyOptions.map((option) => (
            <option key={option} value={option}>
              {dutyLabels[option]}
            </option>
          ))}
        </select>
        <button
          className="h-11 rounded-full bg-primary px-8 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2 lg:col-span-1"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "등록 중" : "등록"}
        </button>
      </form>
      <div className="mt-7 border-t border-[#F2C9C2] pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-black text-[#5A3E3B]">사전등록 목록</h3>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#9B7A75]">
            {preRegistrations.length}건
          </span>
        </div>
        <div className="mt-4 max-h-[260px] space-y-3 overflow-y-auto pr-1">
          {isLoading ? (
            <p className="rounded-[16px] bg-white px-4 py-4 text-sm font-bold text-[#9B7A75]">
              사전등록 목록을 불러오는 중입니다.
            </p>
          ) : preRegistrations.length === 0 ? (
            <p className="rounded-[16px] bg-white px-4 py-4 text-sm font-bold text-[#9B7A75]">
              등록된 사전등록 정보가 없습니다.
            </p>
          ) : (
            preRegistrations.map((preRegistration) => (
              <article
                className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#F2C9C2] bg-white px-4 py-3"
                key={preRegistration.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-black text-[#3F2C28]">{preRegistration.name}</p>
                    <span className="text-sm font-bold text-primary">
                      {positionLabels[preRegistration.position]}
                    </span>
                    <span className="rounded-full bg-[#FBE6EA] px-2 py-1 text-xs font-bold text-primary">
                      가입 대기
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-[#9B7A75]">
                    {preRegistration.branch} · {affiliationLabels[preRegistration.affiliation]} ·{" "}
                    {dutyLabels[preRegistration.duty]}
                  </p>
                </div>
                <button
                  className="h-9 rounded-full border border-[#F0B9C8] bg-white px-4 text-xs font-black text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!onDelete}
                  onClick={() => onDelete?.(preRegistration.id, preRegistration.name)}
                  type="button"
                >
                  삭제
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
