"use client";

import { FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Camera,
  ChevronDown,
  Check,
  ClipboardList,
  ClipboardPenLine,
  Hourglass,
  MapPin,
  Pencil,
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

type DropdownOption = {
  depth?: number;
  label: string;
  value: string;
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

    if (!name.trim() || !region.trim() || !organization.trim() || !positionId || !positionDutyId) {
      setMessage("사진을 제외한 모든 항목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await preRegisterMember(accessToken, {
        branch: region,
        name: name.trim(),
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
              <CustomDropdown
                icon={<MapPin aria-hidden className="h-4 w-4 text-[#7B8B91]" />}
                onChange={setRegion}
                options={regionOptions.map((option) => ({
                  label: option,
                  value: option
                }))}
                value={region}
              />
            </StepField>

            <StepField helper="선택지: 자격증공장 / 수험생연구소" label="소속" step="3">
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
              <CustomDropdown
                disabled={!positionId || dutyOptions.length === 0}
                onChange={(value) => setPositionDutyId(value ? Number(value) : "")}
                options={dutyOptions.map((option) => ({
                  label: option.name,
                  value: String(option.id)
                }))}
                placeholder="담당 업무를 선택해주세요"
                value={positionDutyId ? String(positionDutyId) : ""}
              />
            </StepField>

            <div className="pt-1">
              <button
                className="flex h-10 w-full items-center justify-center gap-1.5 rounded-[10px] border border-[#9DC7ED] bg-[#D8ECFF] text-[13px] font-normal text-[#2D70CB] disabled:opacity-60"
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
                <ClipboardList aria-hidden className="h-5 w-5 text-[#4F6F82]" />
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
    <div className="grid grid-cols-[32px_58px_minmax(0,1fr)] items-start gap-2">
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
    </div>
  );
}

function CustomDropdown({
  disabled = false,
  icon,
  onChange,
  options,
  placeholder = "선택하세요",
  value
}: {
  disabled?: boolean;
  icon?: ReactNode;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-expanded={isOpen}
        className={`flex h-10 w-full items-center gap-2 rounded-[10px] border px-3 text-left text-[13px] font-normal outline-none transition ${
          disabled
            ? "cursor-not-allowed border-[#E1DBD8] bg-[#F3F3F3] text-[#A69E9A]"
            : isOpen
              ? "border-[#9DC7ED] bg-[#F4FAFF] text-[#222222] shadow-[0_0_0_3px_rgba(157,199,237,0.22)]"
              : "border-[#D8D1CE] bg-[#FFFEFC] text-[#222222] hover:border-[#B9B1AD]"
        }`}
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <span className={`min-w-0 flex-1 truncate ${selectedOption ? "" : "text-[#A69E9A]"}`}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 text-[#7B716D] transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-44 overflow-y-auto rounded-[12px] border border-[#D8D1CE] bg-white p-1 shadow-[0_10px_24px_rgba(65,52,48,0.16)]">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-[12px] font-normal text-[#A69E9A]">선택할 항목이 없습니다.</p>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  className={`flex min-h-8 w-full items-center justify-between gap-2 rounded-[9px] px-2 py-1.5 text-left text-[12px] font-normal transition ${
                    isSelected
                      ? "bg-[#EAF3FF] text-[#2D70CB]"
                      : "text-[#4F4542] hover:bg-[#F7F7F7]"
                  }`}
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  type="button"
                >
                  <span
                    className="min-w-0 truncate"
                    style={{ paddingLeft: `${(option.depth ?? 0) * 12}px` }}
                  >
                    {option.label}
                  </span>
                  {isSelected ? <Check aria-hidden className="h-3.5 w-3.5 shrink-0" /> : null}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
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
  const organizationName = getAffiliationLabel(preRegistration.affiliation);

  return (
    <article className="grid grid-cols-[5px_minmax(0,1fr)] overflow-hidden rounded-[14px] border border-[#E6DFDC] bg-[#FFFEFC] shadow-sm">
      <span className="bg-[#D95858]" />
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 rounded-full border border-[#F0C5C5] bg-[#FFF1F1] px-2 py-0.5 text-[10px] font-normal text-[#D95858]">
            <Hourglass aria-hidden className="h-3 w-3" />
            등록 대기
          </span>
          <span className="text-[10px] font-normal text-[#7B716D]">
            등록날짜 {formatDate(preRegistration.createdAt)}
          </span>
        </div>

        <div className="mt-2 grid grid-cols-[42px_minmax(0,1fr)] gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F3F3] text-[15px] font-normal text-[#4F4542]">
            {preRegistration.name.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <strong className="block truncate text-[15px] font-normal text-[#222222]">
              {preRegistration.name}
            </strong>
            <dl className="mt-1 space-y-0.5 text-[11px] font-normal">
              <ProfileLine
                icon={<MapPin aria-hidden className="h-3.5 w-3.5 text-[#7B8B91]" />}
                label="지역"
                value={preRegistration.branch}
              />
              <ProfileLine
                icon={<Building2 aria-hidden className="h-3.5 w-3.5 text-[#7B8B91]" />}
                label="소속"
                value={organizationName}
              />
              <ProfileLine
                icon={<UserRound aria-hidden className="h-3.5 w-3.5 text-[#7B8B91]" />}
                label="직급"
                value={positionName}
              />
              <ProfileLine
                action={
                  <div className="flex shrink-0 gap-1">
                    <button
                      className="flex h-6 min-w-[42px] items-center justify-center gap-0.5 rounded-[7px] border border-[#D8D1CE] bg-white px-1.5 text-[10px] font-normal text-[#4F4542]"
                      type="button"
                    >
                      <Pencil aria-hidden className="h-3 w-3" />
                      수정
                    </button>
                    <button
                      className="flex h-6 min-w-[42px] items-center justify-center gap-0.5 rounded-[7px] border border-[#F0C5C5] bg-[#FFF1F1] px-1.5 text-[10px] font-normal text-[#D95858] disabled:opacity-60"
                      disabled={isDeleting}
                      onClick={onDelete}
                      type="button"
                    >
                      <Trash2 aria-hidden className="h-3 w-3" />
                      {isDeleting ? "삭제 중" : "삭제"}
                    </button>
                  </div>
                }
                icon={<BriefcaseBusiness aria-hidden className="h-3.5 w-3.5 text-[#7B8B91]" />}
                label="담당"
                value={dutyName}
              />
            </dl>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProfileLine({
  action,
  icon,
  label,
  value
}: {
  action?: ReactNode;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="grid min-h-6 grid-cols-[54px_minmax(0,1fr)] items-center gap-1.5">
      <dt className="flex items-center gap-0.5 text-[#9A918D]">
        {icon}
        <span>{label}</span>
      </dt>
      <dd className="flex min-w-0 items-center justify-between gap-1.5 text-[#4F4542]">
        <span className="min-w-0 truncate">{value}</span>
        {action}
      </dd>
    </div>
  );
}

function getAffiliationLabel(affiliation: MemberPreRegistration["affiliation"]) {
  switch (affiliation) {
    case "CEO":
    case "ADMIN":
    case "DEVELOPMENT_TEAM":
      return "수험생연구소";
    case "STAFF":
      return "자격증공장";
    default:
      return "소속 미지정";
  }
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
