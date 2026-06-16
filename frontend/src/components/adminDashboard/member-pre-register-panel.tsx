import { FormEvent, useEffect, useMemo, useState } from "react";
import type { MemberPreRegistration } from "@/api/member";
import { getPositionTree, type PositionTreeNode } from "@/api/position";

type MemberPreRegisterPanelProps = {
  isLoading?: boolean;
  isSubmitting: boolean;
  layout?: "page" | "modal";
  preRegistrations?: MemberPreRegistration[];
  onClose: () => void;
  onDelete?: (id: number, name: string) => void;
  onSubmit: (request: {
    name: string;
    positionDutyId: number;
    positionId: number;
    residenceCity: string;
    residenceDistrict: string;
  }) => Promise<void>;
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
  const [residenceCity, setResidenceCity] = useState("");
  const [residenceDistrict, setResidenceDistrict] = useState("");
  const [positions, setPositions] = useState<PositionTreeNode[]>([]);
  const [positionId, setPositionId] = useState<number | "">("");
  const [positionDutyId, setPositionDutyId] = useState<number | "">("");
  const flatPositions = useMemo(() => flattenPositions(positions), [positions]);
  const selectedPosition = flatPositions.find((position) => position.id === positionId);
  const dutyOptions = selectedPosition?.dutyOptions ?? [];

  useEffect(() => {
    getPositionTree()
      .then(setPositions)
      .catch(() => setPositions([]));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!positionId || !positionDutyId) {
      return;
    }

    await onSubmit({
      name,
      positionDutyId,
      positionId,
      residenceCity,
      residenceDistrict
    });
    setName("");
    setResidenceCity("");
    setResidenceDistrict("");
    setPositionId("");
    setPositionDutyId("");
  }

  function handlePositionChange(value: string) {
    setPositionId(value ? Number(value) : "");
    setPositionDutyId("");
  }

  return (
    <section
      className={
        layout === "modal"
          ? "rounded-[22px] border border-[#F2C9C2] bg-[#FFF8F9] px-6 py-6"
          : "rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-5 py-6 shadow-[0_8px_0_#EFC6BE]"
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
            ? "mt-7 grid gap-4 "
            : "mt-7 grid gap-5 "
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
          onChange={(event) => setResidenceCity(event.target.value)}
          placeholder="거주지 시/도"
          required
          value={residenceCity}
        />
        <input
          className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium outline-none placeholder:text-[#B79A94]"
          onChange={(event) => setResidenceDistrict(event.target.value)}
          placeholder="거주지 시/군/구"
          required
          value={residenceDistrict}
        />
        <select
          className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium text-[#B79A94] outline-none"
          onChange={(event) => handlePositionChange(event.target.value)}
          required
          value={positionId}
        >
          <option value="">직급</option>
          {flatPositions
            .filter((position) => !position.isAdmin)
            .map((position) => (
            <option key={position.id} value={position.id}>
              {"　".repeat(position.depth)}
              {position.name}
            </option>
          ))}
        </select>
        <select
          className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium text-[#B79A94] outline-none"
          disabled={!positionId || dutyOptions.length === 0}
          onChange={(event) => setPositionDutyId(event.target.value ? Number(event.target.value) : "")}
          required
          value={positionDutyId}
        >
          <option value="">역할</option>
          {dutyOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <button
          className="h-11 rounded-full bg-primary px-5 text-sm font-bold text-white disabled:opacity-60  "
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
                      {preRegistration.positionInfo?.name ?? "직급 미지정"}
                    </span>
                    <span className="rounded-full bg-[#FBE6EA] px-2 py-1 text-xs font-bold text-primary">
                      가입 대기
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-[#9B7A75]">
                    {[preRegistration.residenceCity, preRegistration.residenceDistrict].filter(Boolean).join(" · ") || "거주지 미지정"} · {preRegistration.positionDuty?.name ?? preRegistration.positionDuty?.duty ?? "역할 미지정"}
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

type FlatPosition = PositionTreeNode & {
  depth: number;
};

function flattenPositions(positions: PositionTreeNode[], depth = 0): FlatPosition[] {
  return positions.flatMap((position) => [
    {
      ...position,
      depth
    },
    ...flattenPositions(position.children ?? [], depth + 1)
  ]);
}
