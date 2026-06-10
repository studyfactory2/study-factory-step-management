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
import { HelpRequestFormSection } from "@/components/pages/helpRequest/help-request-form-section";
import { HelpRequestHeader } from "@/components/pages/helpRequest/help-request-header";
import { ReceivedHelpRequestsSection } from "@/components/pages/helpRequest/received-help-requests-section";
import { selectableStatuses } from "@/components/pages/helpRequest/constants";

type HelpRequestPageProps = {
  accessToken: string;
  onBack: () => void;
};

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
    <main className="min-h-dvh overflow-hidden bg-background px-3 py-4 text-foreground">
      <div className="pointer-events-none fixed left-10 top-20 text-[#F0C957]">
        <Sparkles aria-hidden className="h-9 w-9 fill-current" />
      </div>
      <div className="pointer-events-none fixed right-12 top-28 text-[#F1A9C0]">
        <Sparkles aria-hidden className="h-8 w-8 fill-current" />
      </div>

      <div className="relative mx-auto w-full max-w-[430px] space-y-5">
        <HelpRequestHeader onBack={onBack} />
        <HelpRequestFormSection
          attachments={attachments}
          fileInputRef={fileInputRef}
          isLoading={isLoading}
          isMemberDropdownOpen={isMemberDropdownOpen}
          isSubmitting={isSubmitting}
          isTaskDropdownOpen={isTaskDropdownOpen}
          members={members}
          message={message}
          onAttachmentChange={setAttachments}
          onMemberDropdownToggle={() => {
            setIsMemberDropdownOpen((isOpen) => !isOpen);
            setIsTaskDropdownOpen(false);
          }}
          onRequestContentChange={setRequestContent}
          onSelectMember={(memberId) => {
            setSelectedMemberId(memberId);
            setIsMemberDropdownOpen(false);
          }}
          onSelectTask={(taskId) => {
            setSelectedTaskId(taskId);
            setIsTaskDropdownOpen(false);
          }}
          onSubmit={handleHelpRequestSubmit}
          onTaskDropdownToggle={() => {
            setIsTaskDropdownOpen((isOpen) => !isOpen);
            setIsMemberDropdownOpen(false);
          }}
          requestContent={requestContent}
          selectedMember={selectedMember}
          selectedTask={selectedTask}
          submitMessage={submitMessage}
          tasks={tasks}
        />
        <ReceivedHelpRequestsSection receivedHelpRequests={receivedHelpRequests} />

        <footer className="rounded-[24px] bg-[#FFF8F6] px-5 py-4 text-center text-base font-black text-[#5A3E3B]">
          도움요청은 내 프로젝트를 필요한 사람에게만 보여주는 기능입니다.
        </footer>
      </div>
    </main>
  );
}

export default HelpRequestPage;
