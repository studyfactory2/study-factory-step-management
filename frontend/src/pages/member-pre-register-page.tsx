"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardList, ClipboardPenLine, UserPlus, UserRound } from "lucide-react";
import {
  deleteMemberPreRegistration,
  getMemberPreRegistrations,
  preRegisterMember,
  updateMemberPreRegistration,
  type MemberPreRegistration
} from "@/api/member";
import { getPositionTree, type PositionTreeNode } from "@/api/position";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import {
  CustomDropdown,
  PendingPreRegistrationGroup,
  StepField
} from "@/components/pages/memberPreRegister/components";
import { type PreRegistrationEditDraft } from "@/components/pages/memberPreRegister/types";
import {
  createEditDraft,
  flattenPositions,
  groupPreRegistrationsByOrganization,
  organizationOptions
} from "@/components/pages/memberPreRegister/utils";


type MemberPreRegisterPageProps = {
  accessToken: string;
  onBack: () => void;
};

export function MemberPreRegisterPage({
  accessToken,
  onBack
}: MemberPreRegisterPageProps) {
  const [name, setName] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [organization, setOrganization] = useState("자격증공장");
  const [positionId, setPositionId] = useState<number | "">("");
  const [dutyText, setDutyText] = useState("");
  const [positions, setPositions] = useState<PositionTreeNode[]>([]);
  const [preRegistrations, setPreRegistrations] = useState<MemberPreRegistration[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<PreRegistrationEditDraft | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<number | null>(null);

  const flatPositions = useMemo(() => flattenPositions(positions), [positions]);
  const selectablePositions = flatPositions.filter((position) => !position.isAdmin && position.isActive);
  const pendingPreRegistrations = preRegistrations.filter((preRegistration) => !preRegistration.isRegistered);
  const pendingGroups = useMemo(
    () => groupPreRegistrationsByOrganization(pendingPreRegistrations),
    [pendingPreRegistrations]
  );

  useEffect(() => {
    getPositionTree()
      .then(setPositions)
      .catch(() => setPositions([]));
  }, []);

  const refreshPreRegistrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextPreRegistrations = await getMemberPreRegistrations(accessToken);
      setPreRegistrations(nextPreRegistrations);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "사전등록 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    refreshPreRegistrations();
  }, [refreshPreRegistrations]);

  function handlePositionChange(value: string) {
    setPositionId(value ? Number(value) : "");
  }

  function resetForm() {
    setName("");
    setJoinedAt("");
    setOrganization("자격증공장");
    setPositionId("");
    setDutyText("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !name.trim()
      || !joinedAt.trim()
      || !organization.trim()
      || !positionId
      || !dutyText.trim()
    ) {
      setMessage("이름, 입사일, 소속, 직위, 담당을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await preRegisterMember(accessToken, {
        dutyText: dutyText.trim(),
        joinedAt,
        name: name.trim(),
        organization,
        positionId
      });
      await refreshPreRegistrations();
      resetForm();
      setMessage("사원 사전등록이 완료되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "사원 사전등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(preRegistration: MemberPreRegistration) {
    setIsDeletingId(preRegistration.id);
    setMessage("");

    try {
      await deleteMemberPreRegistration(accessToken, preRegistration.id);
      await refreshPreRegistrations();
      setMessage(`${preRegistration.name}님의 사전등록 정보를 삭제했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "사전등록 정보를 삭제하지 못했습니다.");
    } finally {
      setIsDeletingId(null);
    }
  }

  function handleStartEdit(preRegistration: MemberPreRegistration) {
    setEditingId(preRegistration.id);
    setEditDraft(createEditDraft(preRegistration));
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  function handleEditDraftChange(nextDraft: Partial<PreRegistrationEditDraft>) {
    setEditDraft((currentDraft) => currentDraft ? { ...currentDraft, ...nextDraft } : currentDraft);
  }

  async function handleSaveEdit(preRegistration: MemberPreRegistration) {
    if (!editDraft) {
      return;
    }

    if (
      !editDraft.name.trim()
      || !editDraft.joinedAt.trim()
      || !editDraft.organization.trim()
      || !editDraft.positionId
      || !editDraft.dutyText.trim()
    ) {
      setMessage("이름, 입사일, 소속, 직위, 담당을 모두 입력해주세요.");
      return;
    }

    setIsUpdatingId(preRegistration.id);
    setMessage("");

    try {
      await updateMemberPreRegistration(accessToken, preRegistration.id, {
        dutyText: editDraft.dutyText.trim(),
        joinedAt: editDraft.joinedAt,
        name: editDraft.name.trim(),
        organization: editDraft.organization,
        positionId: Number(editDraft.positionId)
      });
      await refreshPreRegistrations();
      setEditingId(null);
      setEditDraft(null);
      setMessage(`${editDraft.name.trim()}님의 사전등록 정보를 수정했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "사전등록 정보를 수정하지 못했습니다.");
    } finally {
      setIsUpdatingId(null);
    }
  }

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
          <h1 className="flex items-center justify-center gap-2 text-[25px] font-normal text-[#111111]">
            <UserRound aria-hidden className="h-6 w-6 text-[#111111]" />
            사원사전등록
          </h1>
          <p className="mt-2 text-[14px] font-normal text-[#7B716D]">
            신규 사원 정보를 미리 등록해주세요
          </p>
        </header>

        <MessageBanner message={message} />

        <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <h2 className="flex items-center gap-2 text-[19px] font-normal text-[#222222]">
            <ClipboardPenLine aria-hidden className="h-5 w-5 text-[#4F4542]" />
            신규 사원 정보
          </h2>

          <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
            <StepField label="이름" step="1">
              <input
                className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[15px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A]"
                onChange={(event) => setName(event.target.value)}
                placeholder="사원 이름을 입력하세요"
                required
                value={name}
              />
            </StepField>

            <StepField label="입사일" step="2">
              <div className="relative">
                <CalendarDays aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8B91]" />
                <input
                  className="h-10 w-full cursor-pointer rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] pl-9 pr-3 text-[15px] font-normal text-[#222222] outline-none [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  onClick={(event) => {
                    (event.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
                  }}
                  onChange={(event) => setJoinedAt(event.target.value)}
                  required
                  type="date"
                  value={joinedAt}
                />
              </div>
            </StepField>

            <StepField label="소속" step="3">
              <CustomDropdown
                onChange={setOrganization}
                options={organizationOptions.map((option) => ({
                  label: option,
                  value: option
                }))}
                value={organization}
              />
            </StepField>

            <StepField label="직위" step="4">
              <CustomDropdown
                onChange={handlePositionChange}
                options={selectablePositions.map((position) => ({
                  depth: position.depth,
                  label: position.name,
                  value: String(position.id)
                }))}
                placeholder="직위를 선택하세요"
                value={positionId ? String(positionId) : ""}
              />
            </StepField>

            <StepField label="담당" step="5">
              <input
                className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[15px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A]"
                onChange={(event) => setDutyText(event.target.value)}
                placeholder="담당업무를 입력하세요"
                required
                value={dutyText}
              />
            </StepField>

            <div className="pt-1">
              <button
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-[10px] border border-[#9DC7ED] bg-[#D8ECFF] text-[15px] font-normal text-[#2D70CB] disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                <UserPlus aria-hidden className="h-4 w-4" />
                {isSubmitting ? "등록 중" : "사전등록하기"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-[20px] font-normal text-[#222222]">
                <ClipboardList aria-hidden className="h-5 w-5 text-[#4F6F82]" />
                등록대기
                <span className="rounded-full bg-[#FFF1F1] px-2 py-0.5 text-[13px] text-[#D95858]">
                  {pendingPreRegistrations.length}건
                </span>
              </h2>
              <p className="mt-1 text-[13px] font-normal text-[#7B716D]">
                아직 앱에 가입하지 않은 사원입니다
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {isLoading ? (
              <p className="rounded-[12px] border border-[#E6DFDC] bg-[#FFFEFC] px-3 py-4 text-center text-[14px] text-[#7B716D]">
                사전등록 목록을 불러오는 중입니다.
              </p>
            ) : pendingPreRegistrations.length === 0 ? (
              <p className="rounded-[12px] border border-[#E6DFDC] bg-[#FFFEFC] px-3 py-4 text-center text-[14px] text-[#7B716D]">
                등록대기 중인 사원이 없습니다.
              </p>
            ) : (
              pendingGroups.map((group) => (
                <PendingPreRegistrationGroup
                  editDraft={editDraft}
                  editingId={editingId}
                  isDeletingId={isDeletingId}
                  isUpdatingId={isUpdatingId}
                  key={group.organizationName}
                  onCancelEdit={handleCancelEdit}
                  onDelete={handleDelete}
                  onEdit={handleStartEdit}
                  onEditDraftChange={handleEditDraftChange}
                  onSaveEdit={handleSaveEdit}
                  organizationName={group.organizationName}
                  positions={selectablePositions}
                  preRegistrations={group.items}
                />
              ))
            )}
          </div>
        </section>
      </ResponsiveContainer>
    </main>
  );
}

export default MemberPreRegisterPage;
