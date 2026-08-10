"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, NotebookTabs, RotateCcw, Search, UserX } from "lucide-react";
import { deleteMember, getMembers, restoreMember } from "@/api/member";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import { ConfirmDialog } from "@/components/pages/dashboard/confirm-dialog";
import type { Member } from "@/types/domain";
import { EmployeeOrganizationSection } from "@/components/pages/memberManagement/components";
import {
  getMemberDisplayName,
  getMemberDutyName,
  getMemberOrganizationName,
  getMemberPositionName,
  groupMembersByOrganization
} from "@/components/pages/memberManagement/utils";


type MemberManagementPageProps = {
  accessToken: string;
  currentMemberId: number;
  onBack: () => void;
};

export function MemberManagementPage({ accessToken, currentMemberId, onBack }: MemberManagementPageProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("전체");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);
  const [deletedMemberName, setDeletedMemberName] = useState("");
  const [restoreTarget, setRestoreTarget] = useState<Member | null>(null);
  const [restoringMemberId, setRestoringMemberId] = useState<number | null>(null);
  const [isInactiveMembersOpen, setIsInactiveMembersOpen] = useState(false);

  async function handleDeleteConfirm() {
    if (!deleteTarget || deletingMemberId !== null) {
      return;
    }

    const targetId = deleteTarget.id;
    const targetName = getMemberDisplayName(deleteTarget);
    setDeletingMemberId(targetId);
    setErrorMessage("");

    try {
      await deleteMember(accessToken, targetId);
      setMembers((current) => current.map((member) => (
        member.id === targetId ? { ...member, isActive: false } : member
      )));
      setDeleteTarget(null);
      setDeletedMemberName(targetName);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "사원을 삭제하지 못했습니다.");
      setDeleteTarget(null);
    } finally {
      setDeletingMemberId(null);
    }
  }

  async function handleRestoreConfirm() {
    if (!restoreTarget || restoringMemberId !== null) {
      return;
    }

    const targetId = restoreTarget.id;
    setRestoringMemberId(targetId);
    setErrorMessage("");

    try {
      const restoredMember = await restoreMember(accessToken, targetId);
      setMembers((current) => current.map((member) => (
        member.id === targetId ? { ...member, ...restoredMember, isActive: true } : member
      )));
      setRestoreTarget(null);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "사원을 복구하지 못했습니다.");
      setRestoreTarget(null);
    } finally {
      setRestoringMemberId(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    getMembers()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setMembers(response);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "사원 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDepartmentOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const activeMembers = useMemo(() => members.filter((member) => member.isActive), [members]);
  const inactiveMembers = useMemo(
    () => members
      .filter((member) => !member.isActive)
      .sort((left, right) => getMemberDisplayName(left).localeCompare(getMemberDisplayName(right), "ko-KR")),
    [members]
  );

  const organizationOptions = useMemo(() => {
    const names = activeMembers
      .map(getMemberOrganizationName)
      .filter((value, index, array) => array.indexOf(value) === index);

    return ["전체", ...names];
  }, [activeMembers]);

  const filteredMembers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return activeMembers.filter((member) => {
      const organizationName = getMemberOrganizationName(member);
      const dutyName = getMemberDutyName(member);
      const matchesOrganization = selectedOrganization === "전체" || organizationName === selectedOrganization;
      const matchesKeyword = !keyword
        || getMemberDisplayName(member).toLowerCase().includes(keyword)
        || dutyName.toLowerCase().includes(keyword)
        || getMemberPositionName(member).toLowerCase().includes(keyword);

      return matchesOrganization && matchesKeyword;
    });
  }, [activeMembers, searchKeyword, selectedOrganization]);

  const organizationGroups = useMemo(() => groupMembersByOrganization(filteredMembers), [filteredMembers]);

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <ResponsiveContainer variant="settings">
        <header className="relative pb-1 text-center">
          <button
            aria-label="뒤로가기"
            className="absolute left-0 top-0 flex h-7 min-w-7 items-center justify-center rounded-[9px] border border-[#D8D1CE] bg-[#F7F7F7] px-2.5 text-[13px] font-bold leading-none text-[#333333] shadow-sm sm:h-8 sm:min-w-8 sm:px-3 sm:text-[17px] md:h-9 md:min-w-9 md:text-[19px]"
            onClick={onBack}
            type="button"
          >
            ←
          </button>
          <h1 className="flex items-center justify-center gap-2 text-[26px] font-normal text-[#111111]">
            <NotebookTabs aria-hidden className="h-7 w-7 text-[#222222]" />
            사원목록
          </h1>
          <p className="mt-1 text-[15px] font-normal text-[#7B716D]">총 {filteredMembers.length}명</p>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)_78px] gap-2">
          <label className="flex h-10 items-center gap-2 rounded-[12px] border border-[#D8D1CE] bg-white px-3 shadow-sm">
            <Search aria-hidden className="h-4 w-4 text-[#8D8580]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] font-normal outline-none placeholder:text-[#B0A8A3]"
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="이름, 담당업무 검색"
              value={searchKeyword}
            />
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex h-10 w-full items-center justify-center gap-1 rounded-[12px] border border-[#D8D1CE] bg-white text-[14px] font-normal text-[#4F4542] shadow-sm"
              onClick={() => setIsDepartmentOpen((current) => !current)}
              type="button"
            >
              {selectedOrganization === "전체" ? "부서" : selectedOrganization.replace("수험생", "수험생 ")}
              <ChevronDown aria-hidden className="h-3.5 w-3.5" />
            </button>
            {isDepartmentOpen ? (
              <div className="absolute right-0 top-11 z-20 w-36 overflow-hidden rounded-[12px] border border-[#D8D1CE] bg-white p-1 shadow-[0_8px_18px_rgba(70,55,50,0.16)]">
                {organizationOptions.map((option) => (
                  <button
                    className={`block h-8 w-full rounded-[9px] px-2 text-left text-[13px] font-normal ${
                      option === selectedOrganization ? "bg-[#EAF3FF] text-[#2D70CB]" : "text-[#4F4542] hover:bg-[#F7F7F7]"
                    }`}
                    key={option}
                    onClick={() => {
                      setSelectedOrganization(option);
                      setIsDepartmentOpen(false);
                    }}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <MessageBanner message={errorMessage} />

        {isLoading ? (
          <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-5 text-center text-[15px] font-normal text-[#7B716D] shadow-sm">
            사원 목록을 불러오는 중입니다.
          </section>
        ) : null}

        {!isLoading && organizationGroups.length === 0 ? (
          <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-5 text-center text-[15px] font-normal text-[#7B716D] shadow-sm">
            조건에 맞는 사원이 없습니다.
          </section>
        ) : null}

        <div className="space-y-3">
          {organizationGroups.map((group) => (
            <EmployeeOrganizationSection
              currentMemberId={currentMemberId}
              deletingMemberId={deletingMemberId}
              group={group}
              key={group.organizationName}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>

        <section className="overflow-hidden rounded-[16px] border border-[#DDE4EC] bg-white shadow-[0_2px_10px_rgba(64,76,92,0.07)]">
          <button
            aria-expanded={isInactiveMembersOpen}
            className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-[#F7F9FC]"
            onClick={() => setIsInactiveMembersOpen((current) => !current)}
            type="button"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F3F7] text-[#6B7785]">
              <UserX aria-hidden className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] text-[#27313D]">비활성 회원</span>
              <span className="block text-[12px] text-[#8A95A3]">삭제 처리된 회원을 확인하고 복구할 수 있어요.</span>
            </span>
            <span className="rounded-full bg-[#EEF2F6] px-2 py-0.5 text-[12px] text-[#667281]">{inactiveMembers.length}명</span>
            <ChevronDown
              aria-hidden
              className={`h-4 w-4 text-[#7A8694] transition-transform ${isInactiveMembersOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isInactiveMembersOpen ? (
            <div className="border-t border-[#E8EDF2] bg-[#FAFBFC] p-3">
              {inactiveMembers.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-[#8A95A3]">비활성 회원이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {inactiveMembers.map((member) => (
                    <article
                      className="flex items-center gap-3 rounded-[11px] border border-[#E1E7ED] bg-white px-3 py-2.5"
                      key={member.id}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] text-[#303B47]">{getMemberDisplayName(member)}</span>
                        <span className="block truncate text-[12px] text-[#8A95A3]">
                          {getMemberOrganizationName(member)} · {getMemberPositionName(member)}
                        </span>
                      </span>
                      <button
                        aria-label={`${getMemberDisplayName(member)} 사원 복구`}
                        className="inline-flex h-8 items-center gap-1 rounded-[9px] border border-[#BFD8F7] bg-[#EDF6FF] px-2.5 text-[12px] text-[#2474D2] hover:bg-[#E2F0FF] disabled:cursor-wait disabled:opacity-60"
                        disabled={restoringMemberId === member.id}
                        onClick={() => setRestoreTarget(member)}
                        type="button"
                      >
                        <RotateCcw aria-hidden className="h-3.5 w-3.5" />
                        {restoringMemberId === member.id ? "복구 중" : "복구"}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </section>
      </ResponsiveContainer>

      {deleteTarget ? (
        <ConfirmDialog
          confirmLabel="삭제"
          description={`${getMemberDisplayName(deleteTarget)} 사원을 삭제하시겠습니까?`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void handleDeleteConfirm()}
          title="사원 삭제"
        />
      ) : null}

      {deletedMemberName ? (
        <ConfirmDialog
          cancelLabel={null}
          confirmLabel="확인"
          description={`${deletedMemberName} 사원이 비활성 회원으로 이동되었습니다.`}
          onCancel={() => setDeletedMemberName("")}
          onConfirm={() => setDeletedMemberName("")}
          title="삭제가 완료되었습니다"
        />
      ) : null}

      {restoreTarget ? (
        <ConfirmDialog
          confirmLabel="복구"
          description={`${getMemberDisplayName(restoreTarget)} 사원을 다시 활성화하시겠습니까?`}
          onCancel={() => setRestoreTarget(null)}
          onConfirm={() => void handleRestoreConfirm()}
          title="사원 복구"
        />
      ) : null}
    </main>
  );
}

export default MemberManagementPage;
