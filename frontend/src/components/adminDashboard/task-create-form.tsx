import { FormEvent, useMemo, useState } from "react";
import type { Member } from "@/types/domain";
import { ALL_ASSIGNEES_VALUE, roleLabels } from "./constants";

type TaskCreateFormProps = {
  assignees: Member[];
  branches: string[];
  description: string;
  isLoading: boolean;
  isSubmitting: boolean;
  selectedAssigneeId: string;
  selectedAssigneePositionId: string;
  selectedBranch: string;
  title: string;
  onAssigneeChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (value: string) => void;
};

export function TaskCreateForm({
  assignees,
  branches,
  description,
  isLoading,
  isSubmitting,
  selectedAssigneeId,
  selectedAssigneePositionId,
  selectedBranch,
  title,
  onAssigneeChange,
  onBranchChange,
  onDescriptionChange,
  onPositionChange,
  onSubmit,
  onTitleChange
}: TaskCreateFormProps) {
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const selectedAssignee = assignees.find((member) => String(member.id) === selectedAssigneeId);
  const selectedPositionName = getPositionNameById(assignees, selectedAssigneePositionId);
  const assigneeLabel =
    selectedAssigneeId === ALL_ASSIGNEES_VALUE
      ? selectedPositionName
        ? `${selectedPositionName} 전 직원`
        : selectedBranch
          ? `${selectedBranch} 전 직원`
          : "전 직원"
      : selectedAssignee
        ? `${getMemberPositionName(selectedAssignee)}-${selectedAssignee.name}`
        : "직원";

  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-semibold text-[#5A3E3B]">새 업무 등록</h2>
      <form className="mt-7 space-y-6" onSubmit={onSubmit}>
        <div className="grid items-center gap-5 lg:grid-cols-[240px_1fr]">
          <select
            className="min-h-[52px] rounded-[12px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-5 text-base font-bold text-[#8F7470] outline-none"
            onChange={(event) => onBranchChange(event.target.value)}
            value={selectedBranch}
          >
            <option value="">지점</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <button
            className="min-h-[52px] rounded-[12px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-5 text-left text-base font-bold text-[#8F7470] outline-none transition hover:border-primary"
            onClick={() => setIsAssigneeModalOpen(true)}
            type="button"
          >
            {assigneeLabel}
          </button>
        </div>
        <input
          className="h-12 w-full rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium outline-none placeholder:text-[#B79A94]"
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="업무 제목"
          required
          value={title}
        />
        <textarea
          className="h-20 w-full resize-none rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 py-4 text-sm font-medium outline-none placeholder:text-[#B79A94]"
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="지시내용"
          required
          value={description}
        />
        <div className="flex flex-wrap justify-end gap-3">
          <button
            className="min-h-[52px] rounded-full border border-[#F0B9C8] bg-white px-10 text-base font-black text-primary transition hover:bg-[#FFF7F8]"
            type="button"
          >
            임시저장
          </button>
          <button
            className="min-h-[52px] rounded-full border border-[#D9D1F3] bg-[#F7F3FF] px-10 text-base font-black text-[#8B72C8] transition hover:bg-[#F0EAFF]"
            type="button"
          >
            첨부(사진/수기메모)
          </button>
          <button
            className="min-h-[52px] rounded-full bg-primary px-12 text-base font-black text-white disabled:opacity-60"
            disabled={isSubmitting || isLoading}
            type="submit"
          >
            {isSubmitting ? "등록 중" : "업무 등록"}
          </button>
        </div>
      </form>
      {isAssigneeModalOpen && (
        <AssigneeSelectModal
          assignees={assignees}
          onClose={() => setIsAssigneeModalOpen(false)}
          onSelect={(value, positionId) => {
            onPositionChange(positionId);
            onAssigneeChange(value);
            setIsAssigneeModalOpen(false);
          }}
          selectedAssigneeId={selectedAssigneeId}
          selectedAssigneePositionId={selectedAssigneePositionId}
        />
      )}
    </section>
  );
}

function AssigneeSelectModal({
  assignees,
  onClose,
  onSelect,
  selectedAssigneeId,
  selectedAssigneePositionId
}: {
  assignees: Member[];
  onClose: () => void;
  onSelect: (value: string, positionId: string) => void;
  selectedAssigneeId: string;
  selectedAssigneePositionId: string;
}) {
  const positions = useMemo(() => {
    const positionMap = new Map<string, string>();
    assignees.forEach((member) => {
      if (member.positionId) {
        positionMap.set(String(member.positionId), getMemberPositionName(member));
      }
    });

    return Array.from(positionMap.entries()).map(([id, name]) => ({ id, name }));
  }, [assignees]);
  const selectedAssignee = assignees.find((member) => String(member.id) === selectedAssigneeId);
  const [selectedPositionId, setSelectedPositionId] = useState(
    selectedAssignee?.positionId ? String(selectedAssignee.positionId) : selectedAssigneePositionId
  );
  const positionAssignees = selectedPositionId
    ? assignees.filter((member) => String(member.positionId) === selectedPositionId)
    : assignees;

  function handlePositionChange(value: string) {
    setSelectedPositionId(value);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F2C28]/30 px-4">
      <div className="w-full max-w-[560px] rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] p-7 shadow-[0_18px_44px_rgba(90,62,59,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-black text-[#3F2C28]">직원 선택</p>
            <p className="mt-2 text-sm font-bold text-[#9B7A75]">직위와 직원을 선택해주세요.</p>
          </div>
          <button
            aria-label="직원 선택 닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBE6EA] text-primary"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <select
            className="min-h-[52px] rounded-[12px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-5 text-base font-bold text-[#8F7470] outline-none"
            onChange={(event) => handlePositionChange(event.target.value)}
            value={selectedPositionId}
          >
            <option value="">직위 선택 안 함</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
          <select
            className="min-h-[52px] rounded-[12px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-5 text-base font-bold text-[#8F7470] outline-none"
            onChange={(event) => onSelect(event.target.value, selectedPositionId)}
            value={selectedAssigneeId}
          >
            <option value="">직원</option>
            <option value={ALL_ASSIGNEES_VALUE}>
              {selectedPositionId ? "해당 직위 전 직원" : "전 직원"}
            </option>
            {positionAssignees.map((member) => (
              <option key={member.id} value={member.id}>
                {getMemberPositionName(member)}-{member.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function getMemberPositionName(member: Member): string {
  return member.positionInfo?.name ?? roleLabels[member.roleType];
}

function getPositionNameById(members: Member[], positionId: string): string {
  const member = members.find((candidate) => String(candidate.positionId) === positionId);
  return member ? getMemberPositionName(member) : "";
}
