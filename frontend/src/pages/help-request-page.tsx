"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { getFavoriteMemberCandidates } from "@/api/favorite-member";
import {
  createHelpRequest,
  getReceivedHelpRequests,
  type HelpRequestReceived
} from "@/api/help-request";
import {
  getTaskRecentWorkStatus,
  type TaskRecentWorkStatus
} from "@/api/task";
import type { AdminDashboardEmployee } from "@/api/admin";
import type { TaskStatus } from "@/types/domain";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";

type HelpRequestPageProps = {
  accessToken: string;
  onBack: () => void;
};

const selectableStatuses: TaskStatus[] = ["REGISTERED", "IN_PROGRESS", "REVIEW_REQUESTED", "COMPLETED"];

export function HelpRequestPage({ accessToken, onBack }: HelpRequestPageProps) {
  const [tasks, setTasks] = useState<TaskRecentWorkStatus[]>([]);
  const [members, setMembers] = useState<AdminDashboardEmployee[]>([]);
  const [receivedHelpRequests, setReceivedHelpRequests] = useState<HelpRequestReceived[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestContent, setRequestContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedTask = tasks.find((task) => task.taskId === selectedTaskId) ?? null;
  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? null;

  useEffect(() => {
    async function loadFormOptions() {
      try {
        const [taskOptions, memberOptions, receivedRequests] = await Promise.all([
          getTaskRecentWorkStatus(accessToken, {
            sortOrder: "LATEST",
            statuses: selectableStatuses
          }),
          getFavoriteMemberCandidates(accessToken),
          getReceivedHelpRequests(accessToken)
        ]);
        setTasks(taskOptions);
        setMembers(memberOptions);
        setReceivedHelpRequests(receivedRequests);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "도움요청 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadFormOptions();
  }, [accessToken]);

  async function reloadReceivedHelpRequests() {
    const receivedRequests = await getReceivedHelpRequests(accessToken);
    setReceivedHelpRequests(receivedRequests);
  }

  async function handleHelpRequestSubmit() {
    setSubmitMessage("");

    if (!selectedTaskId) {
      setSubmitMessage("도움을 요청할 업무를 선택해주세요.");
      return;
    }

    if (!selectedMemberId) {
      setSubmitMessage("도움을 요청할 사원을 선택해주세요.");
      return;
    }

    if (!requestContent.trim()) {
      setSubmitMessage("요청내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createHelpRequest(accessToken, {
        attachments,
        content: requestContent.trim(),
        receiverId: selectedMemberId,
        taskId: selectedTaskId
      });
      await reloadReceivedHelpRequests();
      setSelectedTaskId(null);
      setSelectedMemberId(null);
      setAttachments([]);
      setRequestContent("");
      setSubmitMessage("도움요청이 등록되었습니다.");
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "도움요청을 등록하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-background px-4 py-8 text-foreground sm:px-8">
      <div className="pointer-events-none fixed left-10 top-20 text-[#F0C957]">
        <Sparkles aria-hidden className="h-9 w-9 fill-current" />
      </div>
      <div className="pointer-events-none fixed right-12 top-28 text-[#F1A9C0]">
        <Sparkles aria-hidden className="h-8 w-8 fill-current" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] space-y-7">
        <header className="relative flex items-center justify-center">
          <button
            className="absolute left-0 h-11 rounded-full border border-[#F2C9C2] bg-white px-7 text-sm font-black text-[#9B7A75] shadow-sm"
            onClick={onBack}
            type="button"
          >
            ← 뒤로가기
          </button>
          <div className="text-center">
            <h1 className="text-[34px] font-black tracking-normal text-[#3F2C28]">도움요청</h1>
          </div>
        </header>

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
                <div className="relative">
                  <button
                    className="flex min-h-[64px] w-full items-center rounded-[18px] border border-[#F2C9C2] bg-white px-6 text-left text-sm font-black text-[#3F2C28]"
                    onClick={() => {
                      setIsTaskDropdownOpen((isOpen) => !isOpen);
                      setIsMemberDropdownOpen(false);
                    }}
                    type="button"
                  >
                    <span className="min-w-[120px]">업무선택 ▼</span>
                    <span className={`truncate font-bold ${selectedTask ? "text-[#9B7A75]" : "text-[#BFA4A0]"}`}>
                      {selectedTask?.taskTitle ?? "내 프로젝트 중 하나선택"}
                    </span>
                  </button>
                  {isTaskDropdownOpen && (
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
                          onClick={() => {
                            setSelectedTaskId(task.taskId);
                            setIsTaskDropdownOpen(false);
                          }}
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
                <div className="relative">
                  <button
                    className="flex min-h-[64px] w-full items-center rounded-[18px] border border-[#F2C9C2] bg-white px-6 text-left text-sm font-black text-[#3F2C28]"
                    onClick={() => {
                      setIsMemberDropdownOpen((isOpen) => !isOpen);
                      setIsTaskDropdownOpen(false);
                    }}
                    type="button"
                  >
                    <span className="min-w-[150px]">도움을 요청할 사원 ▼</span>
                    <span className={`truncate font-bold ${selectedMember ? "text-[#9B7A75]" : "text-[#BFA4A0]"}`}>
                      {selectedMember ? `${getMemberPositionName(selectedMember)} ${selectedMember.name}` : "함께 확인할 사원을 선택하세요"}
                    </span>
                  </button>
                  {isMemberDropdownOpen && (
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
                          onClick={() => {
                            setSelectedMemberId(member.id);
                            setIsMemberDropdownOpen(false);
                          }}
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
              </div>

              <div>
                <h3 className="mb-3 text-xl font-black text-[#3F2C28]">요청내용</h3>
                <textarea
                  className="min-h-[210px] w-full resize-none rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-5 text-base font-bold leading-8 text-[#5A3E3B] outline-none placeholder:text-[#BFA4A0]"
                  onChange={(event) => setRequestContent(event.target.value)}
                  placeholder={"예) 이 프로젝트 방향이 괜찮은지 확인해 주세요.\n예) 사진 구성과 문구를 보고 한 줄 피드백 부탁드립니다."}
                  value={requestContent}
                />
              </div>

              <div className="flex min-h-[64px] items-center justify-between rounded-[18px] border border-[#F2C9C2] bg-white px-6">
                <span className="text-sm font-black text-[#3F2C28]">사진첨부</span>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  multiple
                  onChange={(event) => setAttachments(Array.from(event.target.files ?? []))}
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

              <div className="grid gap-5 lg:grid-cols-2">
                <button
                  className="min-h-[58px] rounded-full bg-primary text-base font-black text-white disabled:opacity-60"
                  disabled={isSubmitting}
                  onClick={handleHelpRequestSubmit}
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

        <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
          <h2 className="text-2xl font-black text-[#3F2C28]">도움요청 받은 업무</h2>
          <div className="mt-7 overflow-hidden rounded-[18px] border border-[#F2C9C2] bg-white">
            <div className="grid min-h-[54px] grid-cols-[1.2fr_130px_2fr_170px_72px] items-center bg-[#FFF8F6] px-6 text-sm font-black text-[#5A3E3B]">
              <span>직위 이름</span>
              <span className="text-center">상태</span>
              <span>프로젝트제목 / 한줄멘트</span>
              <span className="text-center">요청날짜와 시간</span>
              <span />
            </div>
            <div className="max-h-[420px] divide-y divide-[#F2C9C2] overflow-y-auto">
              {receivedHelpRequests.length === 0 && (
                <div className="px-6 py-10 text-center text-sm font-bold text-[#BFA4A0]">
                  도움요청 받은 업무가 없습니다.
                </div>
              )}
              {receivedHelpRequests.map((request) => (
                <article
                  className="grid min-h-[96px] grid-cols-[1.2fr_130px_2fr_170px_72px] items-center gap-4 px-6 py-4"
                  key={request.id}
                >
                  <p className="text-base font-black text-[#3F2C28]">
                    {request.requesterPositionName ?? roleLabels[request.requesterRoleType]} {request.requesterName}
                  </p>
                  <span className={`flex h-9 items-center justify-center rounded-full border border-[#F2C9C2] text-sm font-black ${getStatusClassName(request.taskStatus)}`}>
                    {getStatusLabel(request.taskStatus)}
                  </span>
                  <div>
                    <p className="text-sm font-black text-[#3F2C28]">{request.taskTitle}</p>
                    <p className="mt-1 text-sm font-bold text-[#9B7A75]">{request.oneLineComment || "\u00A0"}</p>
                    {request.attachments.length > 0 && (
                      <p className="mt-1 text-xs font-bold text-primary">사진 {request.attachments.length}장</p>
                    )}
                  </div>
                  <p className="text-center text-sm font-bold text-[#9B7A75]">{formatDateTime(request.requestedAt)}</p>
                  <button className="h-10 rounded-full bg-[#FBE6EA] text-sm font-black text-primary" type="button">
                    보기
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <footer className="rounded-[24px] bg-[#FFF8F6] px-8 py-5 text-center text-base font-black text-[#5A3E3B]">
          도움요청은 내 프로젝트를 필요한 사람에게만 보여주는 기능입니다.
        </footer>
      </div>
    </main>
  );
}

function getStatusLabel(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "업무등록";
  }

  if (status === "IN_PROGRESS") {
    return "진행중";
  }

  if (status === "REVIEW_REQUESTED") {
    return "검토요청";
  }

  return "완료";
}

function getStatusClassName(status: TaskStatus) {
  if (status === "REGISTERED") {
    return "bg-[#FBE6EA] text-primary";
  }

  if (status === "IN_PROGRESS") {
    return "bg-[#EEE8FF] text-[#8B72C8]";
  }

  if (status === "REVIEW_REQUESTED") {
    return "bg-[#FFF1D7] text-[#C88449]";
  }

  return "bg-[#E8F3DF] text-[#6D956A]";
}

function getMemberPositionName(member: AdminDashboardEmployee) {
  return member.positionName ?? roleLabels[member.roleType];
}

export default HelpRequestPage;
