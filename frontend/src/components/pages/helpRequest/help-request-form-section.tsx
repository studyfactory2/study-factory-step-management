"use client";

import type { RefObject } from "react";
import type { AdminDashboardEmployee } from "@/api/admin";
import type { TaskRecentWorkStatus } from "@/api/task";
import { getMemberPositionName, getStatusLabel } from "./constants";

type HelpRequestFormSectionProps = {
  attachments: File[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  isLoading: boolean;
  isMemberDropdownOpen: boolean;
  isSubmitting: boolean;
  isTaskDropdownOpen: boolean;
  members: AdminDashboardEmployee[];
  message: string;
  onAttachmentChange: (files: File[]) => void;
  onMemberDropdownToggle: () => void;
  onRequestContentChange: (value: string) => void;
  onSelectMember: (memberId: number) => void;
  onSelectTask: (taskId: number) => void;
  onSubmit: () => void;
  onTaskDropdownToggle: () => void;
  requestContent: string;
  selectedMember: AdminDashboardEmployee | null;
  selectedTask: TaskRecentWorkStatus | null;
  submitMessage: string;
  tasks: TaskRecentWorkStatus[];
};

export function HelpRequestFormSection({
  attachments,
  fileInputRef,
  isLoading,
  isMemberDropdownOpen,
  isSubmitting,
  isTaskDropdownOpen,
  members,
  message,
  onAttachmentChange,
  onMemberDropdownToggle,
  onRequestContentChange,
  onSelectMember,
  onSelectTask,
  onSubmit,
  onTaskDropdownToggle,
  requestContent,
  selectedMember,
  selectedTask,
  submitMessage,
  tasks
}: HelpRequestFormSectionProps) {
  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">도움요청 작성</h2>
      <p className="mt-2 text-sm font-bold text-[#9B7A75]">
        내 프로젝트 중 하나를 선택한 뒤, 도움을 요청할 사원에게 프로젝트를 보여주고 코멘트를 받을 수 있습니다.
      </p>

      {isLoading && (
        <div className="mt-6 rounded-[18px] border border-dashed border-[#F2C9C2] bg-white px-5 py-8 text-center text-sm font-bold text-[#BFA4A0]">
          도움요청할 업무를 불러오는 중입니다.
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-[18px] border border-dashed border-[#F2C9C2] bg-white px-5 py-8 text-center text-sm font-bold text-primary">
          {message}
        </div>
      )}

      {!isLoading && !message && (
        <div className="mt-8 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <TaskDropdown
              isOpen={isTaskDropdownOpen}
              onSelectTask={onSelectTask}
              onToggle={onTaskDropdownToggle}
              selectedTask={selectedTask}
              tasks={tasks}
            />
            <MemberDropdown
              isOpen={isMemberDropdownOpen}
              members={members}
              onSelectMember={onSelectMember}
              onToggle={onMemberDropdownToggle}
              selectedMember={selectedMember}
            />
          </div>

          <div>
            <h3 className="mb-3 text-xl font-black text-[#3F2C28]">요청내용</h3>
            <textarea
              className="min-h-[210px] w-full resize-none rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-5 text-base font-bold leading-8 text-[#5A3E3B] outline-none placeholder:text-[#BFA4A0]"
              onChange={(event) => onRequestContentChange(event.target.value)}
              placeholder={"예) 이 프로젝트 방향이 괜찮은지 확인해 주세요.\n예) 사진 구성과 문구를 보고 한 줄 피드백 부탁드립니다."}
              value={requestContent}
            />
          </div>

          <AttachmentPicker
            attachments={attachments}
            fileInputRef={fileInputRef}
            onAttachmentChange={onAttachmentChange}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <button
              className="min-h-[58px] rounded-full bg-primary text-base font-black text-white disabled:opacity-60"
              disabled={isSubmitting}
              onClick={onSubmit}
              type="button"
            >
              {isSubmitting ? "요청 중" : "도움요청하기"}
            </button>
            <button className="min-h-[58px] rounded-full border border-[#F2C9C2] bg-white text-base font-black text-[#9B7A75]" type="button">
              수정
            </button>
          </div>
          {submitMessage && (
            <p className="text-sm font-black text-primary">{submitMessage}</p>
          )}
          <button className="min-h-[52px] w-full rounded-full border border-[#F2C9C2] bg-[#FFF8F6] text-base font-black text-primary" type="button">
            + 도움추가하기
          </button>
        </div>
      )}
    </section>
  );
}

function TaskDropdown({
  isOpen,
  onSelectTask,
  onToggle,
  selectedTask,
  tasks
}: {
  isOpen: boolean;
  onSelectTask: (taskId: number) => void;
  onToggle: () => void;
  selectedTask: TaskRecentWorkStatus | null;
  tasks: TaskRecentWorkStatus[];
}) {
  return (
    <div className="relative">
      <button
        className="flex min-h-[64px] w-full items-center rounded-[18px] border border-[#F2C9C2] bg-white px-6 text-left text-sm font-black text-[#3F2C28]"
        onClick={onToggle}
        type="button"
      >
        <span className="min-w-[120px]">업무선택 ▼</span>
        <span className={`truncate font-bold ${selectedTask ? "text-[#9B7A75]" : "text-[#BFA4A0]"}`}>
          {selectedTask?.taskTitle ?? "내 프로젝트 중 하나선택"}
        </span>
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-[72px] z-20 max-h-[260px] overflow-y-auto rounded-[18px] border border-[#F2C9C2] bg-white shadow-[0_8px_0_#EFC6BE]">
          {tasks.length === 0 && (
            <div className="px-4 py-5 text-sm font-bold text-[#BFA4A0]">
              선택할 수 있는 프로젝트가 없습니다.
            </div>
          )}
          <div className="divide-y divide-[#F7D7D2]">
            {tasks.map((task) => (
              <button
                className="w-full px-4 py-3 text-left text-sm font-bold text-[#5A3E3B] hover:bg-[#FFF8F6]"
                key={task.taskId}
                onClick={() => onSelectTask(task.taskId)}
                type="button"
              >
                <span className="block truncate">{task.taskTitle}</span>
                <span className="mt-1 block text-xs text-[#BFA4A0]">{getStatusLabel(task.taskStatus)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MemberDropdown({
  isOpen,
  members,
  onSelectMember,
  onToggle,
  selectedMember
}: {
  isOpen: boolean;
  members: AdminDashboardEmployee[];
  onSelectMember: (memberId: number) => void;
  onToggle: () => void;
  selectedMember: AdminDashboardEmployee | null;
}) {
  return (
    <div className="relative">
      <button
        className="flex min-h-[64px] w-full items-center rounded-[18px] border border-[#F2C9C2] bg-white px-6 text-left text-sm font-black text-[#3F2C28]"
        onClick={onToggle}
        type="button"
      >
        <span className="min-w-[150px]">도움을 요청할 사원 ▼</span>
        <span className={`truncate font-bold ${selectedMember ? "text-[#9B7A75]" : "text-[#BFA4A0]"}`}>
          {selectedMember ? `${getMemberPositionName(selectedMember)} ${selectedMember.name}` : "함께 확인할 사원을 선택하세요"}
        </span>
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-[72px] z-20 max-h-[260px] overflow-y-auto rounded-[18px] border border-[#F2C9C2] bg-white shadow-[0_8px_0_#EFC6BE]">
          {members.length === 0 && (
            <div className="px-4 py-5 text-sm font-bold text-[#BFA4A0]">
              선택할 수 있는 사원이 없습니다.
            </div>
          )}
          <div className="divide-y divide-[#F7D7D2]">
            {members.map((member) => (
              <button
                className="w-full px-4 py-3 text-left text-sm font-bold text-[#5A3E3B] hover:bg-[#FFF8F6]"
                key={member.id}
                onClick={() => onSelectMember(member.id)}
                type="button"
              >
                <span className="block truncate">{getMemberPositionName(member)} {member.name}</span>
                <span className="mt-1 block text-xs text-[#BFA4A0]">{member.branch ?? "지점 없음"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AttachmentPicker({
  attachments,
  fileInputRef,
  onAttachmentChange
}: {
  attachments: File[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onAttachmentChange: (files: File[]) => void;
}) {
  return (
    <>
      <div className="flex min-h-[64px] items-center justify-between rounded-[18px] border border-[#F2C9C2] bg-white px-6">
        <span className="text-sm font-black text-[#3F2C28]">사진첨부</span>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          multiple
          onChange={(event) => onAttachmentChange(Array.from(event.target.files ?? []))}
          ref={fileInputRef}
          type="file"
        />
        <button
          className="h-10 rounded-full bg-[#FBE6EA] px-10 text-sm font-black text-primary"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          + 사진 추가
        </button>
      </div>
      {attachments.length > 0 && (
        <div className="rounded-[18px] border border-[#F2C9C2] bg-white px-6 py-4">
          <p className="text-sm font-black text-[#3F2C28]">선택한 사진 {attachments.length}장</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <span
                className="rounded-full bg-[#FFF8F6] px-4 py-2 text-xs font-bold text-[#9B7A75]"
                key={`${attachment.name}-${attachment.lastModified}`}
              >
                {attachment.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
