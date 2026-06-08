import { FormEvent, useState } from "react";
import type { MemberAffiliation, MemberDuty, MemberPosition } from "@/types/domain";
import { affiliationLabels, dutyLabels, positionLabels } from "./constants";

type MemberPreRegisterPanelProps = {
  isSubmitting: boolean;
  onClose: () => void;
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
  isSubmitting,
  onClose,
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
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
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
      <form className="mt-7 grid gap-5 lg:grid-cols-[1fr_1fr_180px_180px_180px_auto]" onSubmit={handleSubmit}>
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
          className="h-11 rounded-full bg-primary px-8 text-sm font-bold text-white disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "등록 중" : "등록"}
        </button>
      </form>
    </section>
  );
}
