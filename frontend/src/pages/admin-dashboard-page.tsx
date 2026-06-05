"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { getAdminDashboard, type AdminDashboard } from "@/api/admin";
import { getMembers } from "@/api/member";
import { createTask } from "@/api/task";
import type { Member, MemberRole, TaskStatus } from "@/types/domain";

type AdminDashboardPageProps = {
  accessToken: string;
  onLogout: () => void;
};

const roleLabels: Record<MemberRole, string> = {
  CEO: "대표",
  ADMIN: "관리자",
  OPERATIONS_MANAGER: "운영관리자",
  FACTORY_MANAGER: "공장장",
  DEVELOPMENT_LEAD: "개발팀장",
  DESIGNER: "디자이너",
  MARKETER: "마케팅",
  DEVELOPER: "개발자",
  CONTENT_MANAGER: "콘텐츠 담당",
  EMPLOYEE: "직원",
  STAFF: "스텝"
};

const statusLabels: Record<Exclude<TaskStatus, "COMPLETED">, string> = {
  REGISTERED: "업무등록",
  IN_PROGRESS: "진행중",
  REVIEW_REQUESTED: "검토요청"
};

const emptyDashboard: AdminDashboard = {
  currentMember: {
    id: 0,
    name: "관리자",
    roleType: "ADMIN",
    branch: null
  },
  employees: [],
  branchGroups: [],
  recentOutputs: []
};

const ALL_ASSIGNEES_VALUE = "__ALL__";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(new Date(value))
    .replace(/\\. /g, ".")
    .replace(".", ".");
}

function isAssignableMember(member: Member) {
  return member.isActive && member.roleType !== "CEO" && member.roleType !== "ADMIN";
}

export function AdminDashboardPage({ accessToken, onLogout }: AdminDashboardPageProps) {
  const [dashboard, setDashboard] = useState<AdminDashboard>(emptyDashboard);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardResponse, memberResponse] = await Promise.all([
          getAdminDashboard(accessToken),
          getMembers()
        ]);

        setDashboard(dashboardResponse);
        setMembers(memberResponse.filter(isAssignableMember));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "대시보드를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [accessToken]);

  const branches = useMemo(() => {
    const values = members.map((member) => member.branch).filter((branch): branch is string => !!branch);
    return Array.from(new Set(values));
  }, [members]);

  const roles = useMemo(() => {
    return Array.from(
      new Set(
        members
          .filter((member) => !selectedBranch || member.branch === selectedBranch)
          .map((member) => member.roleType)
      )
    );
  }, [members, selectedBranch]);

  const assignees = useMemo(() => {
    return members.filter((member) => {
      const isSameBranch = !selectedBranch || member.branch === selectedBranch;
      const isSameRole = !selectedRole || member.roleType === selectedRole;
      return isSameBranch && isSameRole;
    });
  }, [members, selectedBranch, selectedRole]);

  async function refreshDashboard() {
    const dashboardResponse = await getAdminDashboard(accessToken);
    setDashboard(dashboardResponse);
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!selectedAssigneeId) {
      setMessage("담당자를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask(accessToken, {
        title,
        description,
        assigneeScope: selectedAssigneeId === ALL_ASSIGNEES_VALUE ? "ALL" : "SINGLE",
        ...(selectedAssigneeId === ALL_ASSIGNEES_VALUE
          ? {}
          : { assigneeId: Number(selectedAssigneeId) })
      });
      setTitle("");
      setDescription("");
      setSelectedAssigneeId("");
      setMessage("업무가 등록되었습니다.");
      await refreshDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "업무를 등록하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBranchChange(value: string) {
    setSelectedBranch(value);
    setSelectedRole("");
    setSelectedAssigneeId("");
  }

  function handleRoleChange(value: string) {
    setSelectedRole(value);
    setSelectedAssigneeId("");
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-background px-4 py-7 text-foreground sm:px-8">
      <div className="pointer-events-none fixed -left-32 -top-28 h-[28rem] w-[28rem] rounded-full bg-[#FDE5EB]" />
      <div className="pointer-events-none fixed -right-28 bottom-36 h-[26rem] w-[26rem] rounded-full bg-[#EFE8FF]" />

      <div className="relative mx-auto w-full max-w-[1180px] space-y-10">
        <header className="flex items-center justify-between rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-5">
          <h1 className="text-[28px] font-semibold tracking-normal text-[#5A3E3B]">
            관리자 대시보드 - {roleLabels[dashboard.currentMember.roleType]}
          </h1>
          <div className="flex items-center gap-5">
            <button className="h-11 rounded-full border-2 border-primary bg-white px-10 text-sm font-semibold text-primary">
              직원 추가
            </button>
            <button aria-label="알림" className="text-primary">
              <Bell aria-hidden className="h-9 w-9 stroke-[2.4]" />
            </button>
          </div>
        </header>

        <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-7 shadow-[0_8px_0_#EFC6BE]">
          <p className="text-[28px] font-medium text-[#5A3E3B]">
            안녕하세요, {dashboard.currentMember.name} 님
          </p>
          <p className="mt-1 text-lg font-medium text-[#9B7A75]">오늘도 즐겁게 일해요! ♥</p>
        </section>

        {message && (
          <div className="rounded-[18px] border border-[#F2C9C2] bg-[#FFFEFC] px-5 py-4 text-sm font-semibold text-primary">
            {message}
          </div>
        )}

        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-[#5A3E3B]">직원 목록</h2>
          <div className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] p-8 shadow-[0_8px_0_#EFC6BE]">
            <div className="flex snap-x gap-6 overflow-x-auto pb-7">
              {dashboard.employees.map((employee) => (
                <article
                  className="w-[240px] shrink-0 snap-start rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-7 text-center shadow-[0_8px_0_#EFC6BE]"
                  key={employee.id}
                >
                  <span
                    className={`mx-auto block h-7 rounded-full border border-[#F2C9C2] px-4 text-sm font-semibold leading-7 ${
                      employee.roleType === "FACTORY_MANAGER"
                        ? "bg-[#E8F3DF] text-[#6D956A]"
                        : "bg-[#FBE6EA] text-primary"
                    }`}
                  >
                    {roleLabels[employee.roleType]}
                  </span>
                  <p className="mt-8 text-2xl font-semibold text-[#5A3E3B]">{employee.name}</p>
                  <p className="mt-2 text-base font-semibold text-primary">
                    {employee.highestTaskStatus ? statusLabels[employee.highestTaskStatus] : "업무등록"}
                  </p>
                  <div className="my-5 border-t border-[#F2C9C2]" />
                  <div className="space-y-2 text-sm font-semibold">
                    <div className="mx-auto h-7 w-28 rounded-full border border-[#F2C9C2] bg-[#FBE6EA] leading-7 text-primary">
                      등록 {employee.taskCounts.registered}건
                    </div>
                    <div className="mx-auto h-7 w-28 rounded-full border border-[#F2C9C2] bg-[#EEE8FF] leading-7 text-[#8B72C8]">
                      진행 {employee.taskCounts.inProgress}건
                    </div>
                    <div className="mx-auto h-7 w-28 rounded-full border border-[#F2C9C2] bg-[#FFF1D7] leading-7 text-[#C88449]">
                      검토 {employee.taskCounts.reviewRequested}건
                    </div>
                  </div>
                  <button className="mt-5 h-9 w-full rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary">
                    상세정보
                  </button>
                </article>
              ))}
            </div>
            <div className="mx-auto h-2 w-[38rem] max-w-full rounded-full bg-[#FBE6EA]">
              <div className="h-2 w-52 rounded-full bg-primary" />
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
          <h2 className="text-2xl font-semibold text-[#5A3E3B]">지역별 스텝</h2>
          <div className="mt-8 grid gap-10 md:grid-cols-3">
            {dashboard.branchGroups.map((branch) => (
              <article
                className="flex items-center justify-between rounded-2xl border border-[#F2C9C2] bg-white px-6 py-5 shadow-[0_7px_0_#EFC6BE]"
                key={branch.branch}
              >
                <div>
                  <p className="text-lg font-semibold text-[#5A3E3B]">{branch.branch} 스텝</p>
                  <p className="mt-1 text-sm font-medium text-[#9B7A75]">{branch.memberCount}명</p>
                </div>
                <button className="h-8 rounded-full border-2 border-primary bg-white px-8 text-sm font-semibold text-primary">
                  개별 보기
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
          <h2 className="text-2xl font-semibold text-[#5A3E3B]">새 업무 등록</h2>
          <form className="mt-7 space-y-6" onSubmit={handleCreateTask}>
            <div className="grid items-center gap-5 lg:grid-cols-[178px_178px_220px_1fr_auto]">
              <select
                className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium text-[#B79A94] outline-none"
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
                className="h-11 rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 text-sm font-medium text-[#B79A94] outline-none"
                onChange={(event) => handleRoleChange(event.target.value)}
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
                onChange={(event) => setSelectedAssigneeId(event.target.value)}
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
              onChange={(event) => setTitle(event.target.value)}
              placeholder="업무 제목"
              required
              value={title}
            />
            <textarea
              className="h-20 w-full resize-none rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-4 py-4 text-sm font-medium outline-none placeholder:text-[#B79A94]"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="지시내용"
              required
              value={description}
            />
          </form>
        </section>

        <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-baseline gap-4">
              <h2 className="text-2xl font-semibold text-[#5A3E3B]">최근 결과물</h2>
              <p className="text-sm font-medium text-[#9B7A75]">
                직원들이 제출한 결과물을 확인하고 피드백을 남겨주세요
              </p>
            </div>
            <div className="relative">
              <select
                className="h-11 w-44 appearance-none rounded-[10px] border-2 border-[#F2C9C2] bg-[#FFF8F6] pl-4 pr-10 text-sm font-medium text-[#B79A94] outline-none"
                defaultValue=""
              >
                <option value="">정렬 순</option>
                <option value="UPDATED_DESC">최근 수정순</option>
                <option value="REVIEW_REQUESTED_DESC">최근 검토요청 순</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#9B7A75]">
                ∨
              </span>
            </div>
          </div>
          <div className="mt-8 rounded-[18px] border border-[#F2C9C2] bg-white p-7">
            <div className="max-h-[340px] space-y-4 overflow-y-auto pr-4">
              {dashboard.recentOutputs.map((output) => (
                <article
                  className="grid items-center gap-5 rounded-2xl border border-[#F2C9C2] bg-[#FFF8F6] px-6 py-5 shadow-[0_7px_0_#EFC6BE] lg:grid-cols-[140px_1fr_150px_150px_140px]"
                  key={output.taskId}
                >
                  <div>
                    <p className="text-sm font-bold text-primary">{roleLabels[output.memberRole]}</p>
                    <p className="mt-2 text-sm font-medium text-[#9B7A75]">{output.memberName}</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-[#5A3E3B]">{output.taskTitle}</p>
                    <p className="mt-2 text-sm font-medium text-[#9B7A75]">
                      업무 시작일: {formatDate(output.startedAt)}
                    </p>
                    <p className="text-sm font-medium text-[#9B7A75]">
                      제출일: {formatDate(output.submittedAt)}
                    </p>
                  </div>
                  <button className="h-9 rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary">
                    첨부사진
                  </button>
                  <button className="h-9 rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary">
                    글 미리보기
                  </button>
                  <div className="space-y-2">
                    <button className="h-9 w-full rounded-full bg-primary text-sm font-bold text-white">
                      검토하기
                    </button>
                    <button className="h-8 w-full rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary">
                      검토 요청
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <button
          className="mx-auto block rounded-full border border-[#F2C9C2] bg-white px-6 py-2 text-sm font-semibold text-[#9B7A75]"
          onClick={onLogout}
          type="button"
        >
          로그아웃
        </button>
      </div>
    </main>
  );
}

export default AdminDashboardPage;
