"use client";

import { FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  Check,
  ClipboardPenLine,
  Edit3,
  MapPin,
  Save,
  Trash2,
  UserRound
} from "lucide-react";
import {
  deleteMemberPreRegistration,
  getMemberPreRegistrations,
  preRegisterMember,
  type MemberPreRegistration
} from "@/api/member";
import { getPositionTree, type PositionTreeNode } from "@/api/position";
import { MessageBanner } from "@/components/adminDashboard/message-banner";

type MemberPreRegisterPageProps = {
  accessToken: string;
  onBack: () => void;
};

type FlatPosition = PositionTreeNode & {
  depth: number;
};

const regionOptions = ["부산", "대구", "서울", "광주"];
const organizationOptions = ["자격증공장", "수험생연구소"];

export function MemberPreRegisterPage({
  accessToken,
  onBack
}: MemberPreRegisterPageProps) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("부산");
  const [organization, setOrganization] = useState("자격증공장");
  const [positionId, setPositionId] = useState<number | "">("");
  const [positionDutyId, setPositionDutyId] = useState<number | "">("");
  const [positions, setPositions] = useState<PositionTreeNode[]>([]);
  const [preRegistrations, setPreRegistrations] = useState<MemberPreRegistration[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const flatPositions = useMemo(() => flattenPositions(positions), [positions]);
  const selectablePositions = flatPositions.filter((position) => !position.isAdmin && position.isActive);
  const selectedPosition = selectablePositions.find((position) => position.id === positionId);
  const dutyOptions = selectedPosition?.dutyOptions ?? [];
  const pendingPreRegistrations = preRegistrations.filter((preRegistration) => !preRegistration.isRegistered);

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
    setPositionDutyId("");
  }

  function resetForm() {
    setName("");
    setRegion("부산");
    setOrganization("자격증공장");
    setPositionId("");
    setPositionDutyId("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!positionId || !positionDutyId) {
      setMessage("직위와 담당 업무를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await preRegisterMember(accessToken, {
        branch: region,
        name,
        positionDutyId,
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

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="relative mx-auto w-full max-w-[360px] space-y-3">
        <header className="relative pb-1 text-center">
          <button
            className="absolute left-0 top-0 h-7 rounded-[9px] border border-[#D8D1CE] bg-[#F7F7F7] px-2.5 text-[11px] font-normal text-[#333333] shadow-sm"
            onClick={onBack}
            type="button"
          >
            ← 뒤로가기
          </button>
          <h1 className="flex items-center justify-center gap-2 text-[23px] font-normal text-[#111111]">
            <UserRound aria-hidden className="h-6 w-6 text-[#111111]" />
            사원사전등록
          </h1>
          <p className="mt-2 text-[12px] font-normal text-[#7B716D]">
            신규 사원 정보를 미리 등록해주세요
          </p>
        </header>

        <MessageBanner message={message} />

        <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <h2 className="flex items-center gap-2 text-[17px] font-normal text-[#222222]">
            <ClipboardPenLine aria-hidden className="h-5 w-5 text-[#4F4542]" />
            신규 사원 정보
          </h2>

          <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
            <div className="flex justify-center">
              <button
                className="flex h-[92px] w-[92px] flex-col items-center justify-center gap-1 rounded-full border border-dashed border-[#B9B1AD] bg-[#FAFAFA] text-[11px] font-normal text-[#7B716D]"
                type="button"
              >
                <Camera aria-hidden className="h-5 w-5 text-[#8C817D]" />
                사진 추가
                <span className="text-[9px] text-[#A69E9A]">필수 아님</span>
              </button>
            </div>

            <StepField label="이름" step="1">
              <input
                className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A]"
                onChange={(event) => setName(event.target.value)}
                placeholder="사원 이름을 입력하세요"
                required
                value={name}
              />
            </StepField>

            <StepField label="지역" step="2">
              <div className="relative">
                <MapPin aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8B91]" />
                <select
                  className="h-10 w-full appearance-none rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-9 text-[13px] font-normal text-[#222222] outline-none"
                  onChange={(event) => setRegion(event.target.value)}
                  required
                  value={region}
                >
                  {regionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </StepField>

            <StepField helper="선택지: 자격증공장 / 수험생연구소" label="소속" step="3">
              <select
                className="h-10 w-full appearance-none rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[13px] font-normal text-[#222222] outline-none"
                onChange={(event) => setOrganization(event.target.value)}
                value={organization}
              >
                {organizationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </StepField>

            <StepField label="직위" step="4">
              <select
                className="h-10 w-full appearance-none rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[13px] font-normal text-[#222222] outline-none"
                onChange={(event) => handlePositionChange(event.target.value)}
                required
                value={positionId}
              >
                <option value="">직위를 선택하세요</option>
                {selectablePositions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {"　".repeat(position.depth)}
                    {position.name}
                  </option>
                ))}
              </select>
            </StepField>

            <StepField label="담당" step="5">
              <select
                className="h-10 w-full appearance-none rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[13px] font-normal text-[#222222] outline-none disabled:bg-[#F3F3F3] disabled:text-[#A69E9A]"
                disabled={!positionId || dutyOptions.length === 0}
                onChange={(event) => setPositionDutyId(event.target.value ? Number(event.target.value) : "")}
                required
                value={positionDutyId}
              >
                <option value="">담당 업무를 선택해주세요</option>
                {dutyOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </StepField>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#E2C76F] bg-[#FFF3B8] text-[13px] font-normal text-[#8B6B10]"
                onClick={resetForm}
                type="button"
              >
                <Edit3 aria-hidden className="h-4 w-4" />
                수정하기
              </button>
              <button
                className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#9DC7ED] bg-[#D8ECFF] text-[13px] font-normal text-[#2D70CB] disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                <Save aria-hidden className="h-4 w-4" />
                {isSubmitting ? "등록 중" : "사전등록하기"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-[18px] font-normal text-[#222222]">
                등록대기
                <span className="rounded-full bg-[#FFF1F1] px-2 py-0.5 text-[11px] text-[#D95858]">
                  {pendingPreRegistrations.length}건
                </span>
              </h2>
              <p className="mt-1 text-[11px] font-normal text-[#7B716D]">
                아직 앱에 가입하지 않은 사원입니다
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {isLoading ? (
              <p className="rounded-[12px] border border-[#E6DFDC] bg-[#FFFEFC] px-3 py-4 text-center text-[12px] text-[#7B716D]">
                사전등록 목록을 불러오는 중입니다.
              </p>
            ) : pendingPreRegistrations.length === 0 ? (
              <p className="rounded-[12px] border border-[#E6DFDC] bg-[#FFFEFC] px-3 py-4 text-center text-[12px] text-[#7B716D]">
                등록대기 중인 사원이 없습니다.
              </p>
            ) : (
              pendingPreRegistrations.map((preRegistration) => (
                <PendingPreRegistrationCard
                  isDeleting={isDeletingId === preRegistration.id}
                  key={preRegistration.id}
                  onDelete={() => handleDelete(preRegistration)}
                  preRegistration={preRegistration}
                />
              ))
            )}
          </div>
        </section>

        <p className="rounded-[12px] border border-[#D8D1CE] bg-[#F7F7F7] px-3 py-2 text-center text-[11px] font-normal text-[#6F6662]">
          저장 후 사원이 앱 로그인 시 자동 매칭됩니다
        </p>
      </div>
    </main>
  );
}

function StepField({
  children,
  helper,
  label,
  step
}: {
  children: ReactNode;
  helper?: string;
  label: string;
  step: string;
}) {
  return (
    <label className="grid grid-cols-[32px_58px_minmax(0,1fr)] items-start gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FBE3E8] text-[13px] font-normal text-[#C24D68]">
        {step}
      </span>
      <span className="pt-2 text-[13px] font-normal text-[#4F4542]">{label}</span>
      <span className="min-w-0">
        {children}
        {helper ? (
          <span className="mt-1 block text-[10px] font-normal text-[#9A918D]">{helper}</span>
        ) : null}
      </span>
    </label>
  );
}

function PendingPreRegistrationCard({
  isDeleting,
  onDelete,
  preRegistration
}: {
  isDeleting: boolean;
  onDelete: () => void;
  preRegistration: MemberPreRegistration;
}) {
  const positionName = preRegistration.positionInfo?.name ?? preRegistration.position ?? "직위 미지정";
  const dutyName = preRegistration.positionDuty?.name ?? preRegistration.positionDuty?.duty ?? preRegistration.duty ?? "담당 미지정";

  return (
    <article className="grid grid-cols-[5px_minmax(0,1fr)] overflow-hidden rounded-[14px] border border-[#E6DFDC] bg-[#FFFEFC] shadow-sm">
      <span className="bg-[#D95858]" />
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F3F3] text-[15px] font-normal text-[#4F4542]">
              {preRegistration.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <strong className="text-[15px] font-normal text-[#222222]">{preRegistration.name}</strong>
                <span className="rounded-full border border-[#F0C5C5] bg-[#FFF1F1] px-2 py-0.5 text-[10px] font-normal text-[#D95858]">
                  등록대기
                </span>
              </div>
              <p className="mt-1 text-[11px] font-normal text-[#7B716D]">
                등록일 {formatDate(preRegistration.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-normal">
          <InfoItem label="지역" value={preRegistration.branch} />
          <InfoItem label="소속" value="소속 미지정" />
          <InfoItem label="직위" value={positionName} />
          <InfoItem label="담당" value={dutyName} />
        </dl>

        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <button
            className="h-8 rounded-[9px] border border-[#D8D1CE] bg-white text-[11px] font-normal text-[#4F4542]"
            type="button"
          >
            수정
          </button>
          <button
            className="flex h-8 items-center justify-center gap-1 rounded-[9px] border border-[#9DC7ED] bg-[#D8ECFF] text-[11px] font-normal text-[#2D70CB]"
            type="button"
          >
            <Check aria-hidden className="h-3.5 w-3.5" />
            저장
          </button>
          <button
            className="flex h-8 items-center justify-center gap-1 rounded-[9px] border border-[#F0C5C5] bg-[#FFF1F1] text-[11px] font-normal text-[#D95858] disabled:opacity-60"
            disabled={isDeleting}
            onClick={onDelete}
            type="button"
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" />
            {isDeleting ? "삭제 중" : "삭제"}
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoItem({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[9px] bg-[#F7F7F7] px-2 py-1.5">
      <dt className="text-[#9A918D]">{label}</dt>
      <dd className="mt-0.5 truncate text-[#4F4542]">{value}</dd>
    </div>
  );
}

function flattenPositions(positions: PositionTreeNode[], depth = 0): FlatPosition[] {
  return positions.flatMap((position) => [
    {
      ...position,
      depth
    },
    ...flattenPositions(position.children ?? [], depth + 1)
  ]);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit"
  }).format(date);
}

export default MemberPreRegisterPage;
