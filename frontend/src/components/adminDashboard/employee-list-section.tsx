import { useMemo, useState } from "react";
import type { AdminDashboardEmployee } from "@/api/admin";
import { statusLabels } from "./constants";

type VisibleTaskStatus = "REGISTERED" | "IN_PROGRESS" | "REVIEW_REQUESTED";

type EmployeeListSectionProps = {
  candidates: AdminDashboardEmployee[];
  employees: AdminDashboardEmployee[];
  isUpdating: boolean;
  onAddFavoriteMember: (memberId: number) => void;
  onDeleteFavoriteMember: (memberId: number, memberName: string) => void;
};

export function EmployeeListSection({
  candidates,
  employees,
  isUpdating,
  onAddFavoriteMember,
  onDeleteFavoriteMember
}: EmployeeListSectionProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const favoriteMemberIds = employees.map((employee) => employee.id);
  const addableCandidates = candidates.filter((candidate) => !favoriteMemberIds.includes(candidate.id));
  const visibleEmployees = employees;
  const favoriteSlots: Array<AdminDashboardEmployee | null> = Array.from({ length: 10 }, (_, index) =>
    visibleEmployees[index] ?? null
  );

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-[#3F2C28]">함께 프로젝트 중</h2>
      </div>
      <div className="rounded-[28px] border border-[#F1CFD5] bg-[#FFFEFC]/95 p-7 shadow-[0_10px_22px_rgba(239,126,158,0.12)]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {favoriteSlots.map((employee, index) => (
            employee ? (
              <EmployeeCard
                employee={employee}
                key={employee.id}
                onRemove={() => onDeleteFavoriteMember(employee.id, employee.name)}
              />
            ) : (
              <EmptySlot
                disabled={isUpdating || employees.length >= 10}
                key={`empty-${index}`}
                onSelect={() => setIsAddModalOpen(true)}
                slotNumber={index + 1}
              />
            )
          ))}
        </div>

        {isAddModalOpen && (
          <FavoriteMemberAddModal
            candidates={addableCandidates}
            isUpdating={isUpdating}
            onAddFavoriteMember={(memberId) => {
              onAddFavoriteMember(memberId);
              setIsAddModalOpen(false);
            }}
            onClose={() => setIsAddModalOpen(false)}
          />
        )}
      </div>
    </section>
  );
}

function EmployeeCard({
  employee,
  onRemove
}: {
  employee: AdminDashboardEmployee;
  onRemove: () => void;
}) {
  const [visibleStatus, setVisibleStatus] = useState<VisibleTaskStatus>(
    employee.highestTaskStatus ?? "REGISTERED"
  );
  const visibleStatusCount = getVisibleStatusCount(employee, visibleStatus);

  function handleStatusClick() {
    setVisibleStatus((currentStatus) => {
      if (currentStatus === "REGISTERED") {
        return "IN_PROGRESS";
      }

      if (currentStatus === "IN_PROGRESS") {
        return "REVIEW_REQUESTED";
      }

      return "REGISTERED";
    });
  }

  return (
    <article className="relative min-h-[252px] rounded-[24px] border border-[#F1CFD5] bg-white px-5 py-5 text-center shadow-[0_8px_0_#F3D1D8]">
      <button
        aria-label={`${employee.name} 삭제`}
        className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#F1CFD5] bg-[#FFF8F9] text-xs font-black text-primary"
        onClick={onRemove}
        type="button"
      >
        ×
      </button>
      <span className="block text-sm font-black text-[#8F7470]">
        {employee.positionName ?? "직원"}
      </span>
      <p className="mt-5 text-xl font-black text-[#3F2C28]">{employee.name}</p>
      <p className="mt-2 text-sm font-black text-primary">
        {employee.highestTaskStatus ? statusLabels[employee.highestTaskStatus] : "업무등록"}
      </p>
      <div className="my-4 border-t border-[#F1CFD5]" />
      <button
        className={`mx-auto h-10 w-32 rounded-full border border-[#F1CFD5] text-sm font-black ${getStatusClassName(visibleStatus)}`}
        onClick={handleStatusClick}
        type="button"
      >
        {getShortStatusLabel(visibleStatus)} {visibleStatusCount}건
      </button>
      <button className="mt-5 h-9 w-full rounded-full border border-[#F0B9C8] bg-white text-sm font-black text-primary">
        상세정보
      </button>
    </article>
  );
}

function EmptySlot({
  disabled,
  onSelect,
  slotNumber
}: {
  disabled: boolean;
  onSelect: () => void;
  slotNumber: number;
}) {
  return (
    <button
      className="flex min-h-[252px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#F1CFD5] bg-[#FFF8F9] px-5 py-5 text-center transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={onSelect}
      type="button"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-black text-[#F188A4] shadow-sm">
        +
      </span>
      <p className="mt-4 text-sm font-black text-[#9C7D79]">{slotNumber}번 슬롯</p>
      <p className="mt-1 text-xs font-bold text-[#B79A94]">직원 미선택</p>
    </button>
  );
}

function FavoriteMemberAddModal({
  candidates,
  isUpdating,
  onAddFavoriteMember,
  onClose
}: {
  candidates: AdminDashboardEmployee[];
  isUpdating: boolean;
  onAddFavoriteMember: (memberId: number) => void;
  onClose: () => void;
}) {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const branches = useMemo(() => {
    const values = candidates.map((candidate) => candidate.branch ?? "미지정");
    return Array.from(new Set(values));
  }, [candidates]);
  const positions = useMemo(() => {
    const values = candidates
      .filter((candidate) => !selectedBranch || (candidate.branch ?? "미지정") === selectedBranch)
      .map((candidate) => candidate.positionName ?? "직원");
    return Array.from(new Set(values));
  }, [candidates, selectedBranch]);
  const assignees = useMemo(() => {
    return candidates.filter((candidate) => {
      const isSameBranch = !selectedBranch || (candidate.branch ?? "미지정") === selectedBranch;
      const isSamePosition = !selectedPosition || (candidate.positionName ?? "직원") === selectedPosition;
      return isSameBranch && isSamePosition;
    });
  }, [candidates, selectedBranch, selectedPosition]);

  function handleBranchChange(value: string) {
    setSelectedBranch(value);
    setSelectedPosition("");
    setSelectedMemberId("");
  }

  function handlePositionChange(value: string) {
    setSelectedPosition(value);
    setSelectedMemberId("");
  }

  function handleSubmit() {
    if (!selectedMemberId) {
      return;
    }

    onAddFavoriteMember(Number(selectedMemberId));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F2C28]/25 px-4">
      <div className="w-full max-w-[520px] rounded-[28px] border border-[#F1CFD5] bg-[#FFFEFC] p-7 shadow-[0_18px_40px_rgba(63,44,40,0.18)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-2xl font-black text-[#3F2C28]">직원 선택</h3>
          <button
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F1CFD5] bg-[#FFF8F9] text-sm font-black text-primary"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="mt-6 grid gap-4">
          <select
            className="h-12 rounded-[14px] border border-[#F1CFD5] bg-[#FFF8F6] px-4 text-sm font-bold text-[#9B7A75] outline-none"
            onChange={(event) => handleBranchChange(event.target.value)}
            value={selectedBranch}
          >
            <option value="">브랜치</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <select
            className="h-12 rounded-[14px] border border-[#F1CFD5] bg-[#FFF8F6] px-4 text-sm font-bold text-[#9B7A75] outline-none"
            onChange={(event) => handlePositionChange(event.target.value)}
            value={selectedPosition}
          >
            <option value="">직위</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          <select
            className="h-12 rounded-[14px] border border-[#F1CFD5] bg-[#FFF8F6] px-4 text-sm font-bold text-[#9B7A75] outline-none"
            onChange={(event) => setSelectedMemberId(event.target.value)}
            value={selectedMemberId}
          >
            <option value="">담당자</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </div>
        {candidates.length === 0 && (
          <p className="mt-5 rounded-[16px] border border-dashed border-[#F1CFD5] bg-[#FFF8F9] px-4 py-5 text-sm font-bold text-[#9C7D79]">
            추가할 직원이 없습니다.
          </p>
        )}
        <div className="mt-7 flex justify-end gap-3">
          <button
            className="h-11 rounded-full border border-[#F1CFD5] bg-white px-6 text-sm font-black text-[#9C7D79]"
            onClick={onClose}
            type="button"
          >
            취소
          </button>
          <button
            className="h-11 rounded-full bg-primary px-8 text-sm font-black text-white disabled:opacity-60"
            disabled={!selectedMemberId || isUpdating}
            onClick={handleSubmit}
            type="button"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

function getShortStatusLabel(status: VisibleTaskStatus) {
  if (status === "REGISTERED") {
    return "등록";
  }

  if (status === "IN_PROGRESS") {
    return "진행";
  }

  return "검토";
}

function getStatusClassName(status: VisibleTaskStatus) {
  if (status === "REGISTERED") {
    return "bg-[#FBE6EA] text-primary";
  }

  if (status === "IN_PROGRESS") {
    return "bg-[#EEE8FF] text-[#8B72C8]";
  }

  return "bg-[#FFF1D7] text-[#C88449]";
}

function getVisibleStatusCount(employee: AdminDashboardEmployee, status: VisibleTaskStatus) {
  if (status === "REGISTERED") {
    return employee.taskCounts.registered;
  }

  if (status === "IN_PROGRESS") {
    return employee.taskCounts.inProgress;
  }

  return employee.taskCounts.reviewRequested;
}
