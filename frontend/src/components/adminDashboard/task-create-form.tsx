import { FormEvent } from "react";
import type { Member, MemberRole } from "@/types/domain";
import { ALL_ASSIGNEES_VALUE, roleLabels } from "./constants";

type TaskCreateFormProps = {
  assignees: Member[];
  branches: string[];
  description: string;
  isLoading: boolean;
  isSubmitting: boolean;
  roles: MemberRole[];
  selectedAssigneeId: string;
  selectedBranch: string;
  selectedRole: string;
  title: string;
  onAssigneeChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTitleChange: (value: string) => void;
};

export function TaskCreateForm({
  assignees,
  branches,
  description,
  isLoading,
  isSubmitting,
  roles,
  selectedAssigneeId,
  selectedBranch,
  selectedRole,
  title,
  onAssigneeChange,
  onBranchChange,
  onDescriptionChange,
  onRoleChange,
  onSubmit,
  onTitleChange
}: TaskCreateFormProps) {
  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-semibold text-[#5A3E3B]">새 업무 등록</h2>
      <form className="mt-7 space-y-6" onSubmit={onSubmit}>
        <div className="grid items-center gap-5 lg:grid-cols-[178px_178px_220px_1fr_auto]">
          <select
            className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium text-[#B79A94] outline-none"
            onChange={(event) => onBranchChange(event.target.value)}
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
            className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium text-[#B79A94] outline-none"
            onChange={(event) => onRoleChange(event.target.value)}
            value={selectedRole}
          >
            <option value="">직위</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium text-[#B79A94] outline-none"
            onChange={(event) => onAssigneeChange(event.target.value)}
            value={selectedAssigneeId}
          >
            <option value="">담당자</option>
            <option value={ALL_ASSIGNEES_VALUE}>전 직원</option>
            {assignees.map((member) => (
              <option key={member.id} value={member.id}>
                {roleLabels[member.roleType]} - {member.name}
              </option>
            ))}
          </select>
          <div />
          <button
            className="h-14 rounded-full bg-primary px-16 text-base font-bold text-white disabled:opacity-60"
            disabled={isSubmitting || isLoading}
            type="submit"
          >
            {isSubmitting ? "등록 중" : "업무 등록"}
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
      </form>
    </section>
  );
}
