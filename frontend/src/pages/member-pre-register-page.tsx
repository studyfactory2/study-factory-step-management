"use client";

import { FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type LucideIcon,
  Building2,
  Camera,
  CalendarDays,
  ChevronDown,
  Check,
  ClipboardList,
  ClipboardPenLine,
  Code2,
  Crown,
  LibraryBig,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  UserRound
} from "lucide-react";
import {
  deleteMemberPreRegistration,
  getMemberPreRegistrations,
  preRegisterMember,
  updateMemberPreRegistration,
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

type PreRegistrationEditDraft = {
  age: string;
  dutyText: string;
  joinedAt: string;
  name: string;
  organization: string;
  phoneNumber: string;
  positionId: string;
  residenceCity: string;
  residenceDistrict: string;
};

const organizationOptions = ["자격증공장", "수험생연구소"];

const residenceOptions: Record<string, string[]> = {
  서울특별시: [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구",
    "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구",
    "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
  ],
  부산광역시: [
    "강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구",
    "서구", "수영구", "연제구", "영도구", "중구", "해운대구"
  ],
  대구광역시: ["군위군", "남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
  인천광역시: ["강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"],
  광주광역시: ["광산구", "남구", "동구", "북구", "서구"],
  대전광역시: ["대덕구", "동구", "서구", "유성구", "중구"],
  울산광역시: ["남구", "동구", "북구", "울주군", "중구"],
  세종특별자치시: ["세종시"],
  경기도: [
    "가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시",
    "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "양평군", "여주시",
    "연천군", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시",
    "화성시"
  ],
  강원특별자치도: [
    "강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군", "원주시", "인제군",
    "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군", "화천군", "횡성군"
  ],
  충청북도: ["괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "증평군", "진천군", "청주시", "충주시"],
  충청남도: [
    "계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서산시", "서천군", "아산시",
    "예산군", "천안시", "청양군", "태안군", "홍성군"
  ],
  전북특별자치도: [
    "고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군", "익산시", "임실군",
    "장수군", "전주시", "정읍시", "진안군"
  ],
  전라남도: [
    "강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시", "무안군", "보성군",
    "순천시", "신안군", "여수시", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군",
    "해남군", "화순군"
  ],
  경상북도: [
    "경산시", "경주시", "고령군", "구미시", "김천시", "문경시", "봉화군", "상주시", "성주군", "안동시",
    "영덕군", "영양군", "영주시", "영천시", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군",
    "칠곡군", "포항시"
  ],
  경상남도: [
    "거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군", "양산시", "의령군",
    "진주시", "창녕군", "창원시", "통영시", "하동군", "함안군", "함양군", "합천군"
  ],
  제주특별자치도: ["서귀포시", "제주시"]
};

export function MemberPreRegisterPage({
  accessToken,
  onBack
}: MemberPreRegisterPageProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [joinedAt, setJoinedAt] = useState("");
  const [residenceCity, setResidenceCity] = useState("");
  const [residenceDistrict, setResidenceDistrict] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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
  const residenceCityOptions = Object.keys(residenceOptions);
  const residenceDistrictOptions = residenceCity ? residenceOptions[residenceCity] ?? [] : [];
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

  function handleResidenceCityChange(value: string) {
    setResidenceCity(value);
    setResidenceDistrict("");
  }

  function handlePhoneNumberChange(value: string) {
    setPhoneNumber(formatPhoneInput(value));
  }

  function resetForm() {
    setName("");
    setAge("");
    setJoinedAt("");
    setResidenceCity("");
    setResidenceDistrict("");
    setPhoneNumber("");
    setOrganization("자격증공장");
    setPositionId("");
    setDutyText("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !name.trim()
      || !age.trim()
      || !joinedAt.trim()
      || !residenceCity.trim()
      || !residenceDistrict.trim()
      || !phoneNumber.trim()
      || !organization.trim()
      || !positionId
      || !dutyText.trim()
    ) {
      setMessage("사진을 제외한 모든 항목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const residence = `${residenceCity.trim()} ${residenceDistrict.trim()}`;

      await preRegisterMember(accessToken, {
        age: Number(age),
        branch: residence,
        dutyText: dutyText.trim(),
        joinedAt,
        name: name.trim(),
        organization,
        phoneNumber: phoneNumber.trim(),
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
      || !editDraft.age.trim()
      || !editDraft.joinedAt.trim()
      || !editDraft.residenceCity.trim()
      || !editDraft.residenceDistrict.trim()
      || !editDraft.phoneNumber.trim()
      || !editDraft.organization.trim()
      || !editDraft.positionId
      || !editDraft.dutyText.trim()
    ) {
      setMessage("사진을 제외한 모든 항목을 입력해주세요.");
      return;
    }

    setIsUpdatingId(preRegistration.id);
    setMessage("");

    try {
      await updateMemberPreRegistration(accessToken, preRegistration.id, {
        age: Number(editDraft.age),
        branch: `${editDraft.residenceCity.trim()} ${editDraft.residenceDistrict.trim()}`,
        dutyText: editDraft.dutyText.trim(),
        joinedAt: editDraft.joinedAt,
        name: editDraft.name.trim(),
        organization: editDraft.organization,
        phoneNumber: editDraft.phoneNumber.trim(),
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

            <StepField label="나이" step="2">
              <input
                className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A]"
                min="1"
                onChange={(event) => setAge(event.target.value)}
                placeholder="나이를 입력하세요"
                required
                type="number"
                value={age}
              />
            </StepField>

            <StepField label="입사일" step="3">
              <div className="relative">
                <CalendarDays aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8B91]" />
                <input
                  className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-9 text-[13px] font-normal text-[#222222] outline-none"
                  onChange={(event) => setJoinedAt(event.target.value)}
                  required
                  type="date"
                  value={joinedAt}
                />
              </div>
            </StepField>

            <StepField label="거주지" step="4">
              <div className="grid grid-cols-2 gap-2">
                <CustomDropdown
                  icon={<MapPin aria-hidden className="h-4 w-4 text-[#7B8B91]" />}
                  onChange={handleResidenceCityChange}
                  options={residenceCityOptions.map((option) => ({
                    label: option,
                    value: option
                  }))}
                  placeholder="시"
                  value={residenceCity}
                />
                <CustomDropdown
                  disabled={!residenceCity}
                  onChange={setResidenceDistrict}
                  options={residenceDistrictOptions.map((option) => ({
                    label: option,
                    value: option
                  }))}
                  placeholder="구"
                  value={residenceDistrict}
                />
              </div>
            </StepField>

            <StepField label="전화번호" step="5">
              <div className="relative">
                <Phone aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B8B91]" />
                <input
                  className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-9 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A]"
                  inputMode="numeric"
                  maxLength={13}
                  onChange={(event) => handlePhoneNumberChange(event.target.value)}
                  placeholder="번호만 입력해주세요"
                  required
                  type="tel"
                  value={phoneNumber}
                />
              </div>
            </StepField>

            <StepField label="소속" step="6">
              <CustomDropdown
                onChange={setOrganization}
                options={organizationOptions.map((option) => ({
                  label: option,
                  value: option
                }))}
                value={organization}
              />
            </StepField>

            <StepField label="직위" step="7">
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

            <StepField label="담당" step="8">
              <input
                className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#A69E9A]"
                onChange={(event) => setDutyText(event.target.value)}
                placeholder="담당업무를 입력하세요"
                required
                value={dutyText}
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

function PendingPreRegistrationGroup({
  editDraft,
  editingId,
  isDeletingId,
  isUpdatingId,
  onCancelEdit,
  onDelete,
  onEdit,
  onEditDraftChange,
  onSaveEdit,
  organizationName,
  positions,
  preRegistrations
}: {
  editDraft: PreRegistrationEditDraft | null;
  editingId: number | null;
  isDeletingId: number | null;
  isUpdatingId: number | null;
  onCancelEdit: () => void;
  onDelete: (preRegistration: MemberPreRegistration) => void;
  onEdit: (preRegistration: MemberPreRegistration) => void;
  onEditDraftChange: (nextDraft: Partial<PreRegistrationEditDraft>) => void;
  onSaveEdit: (preRegistration: MemberPreRegistration) => void;
  organizationName: string;
  positions: FlatPosition[];
  preRegistrations: MemberPreRegistration[];
}) {
  const organizationMeta = getOrganizationGroupMeta(organizationName);
  const OrganizationIcon = organizationMeta.icon;

  return (
    <section className={`rounded-[14px] border p-2.5 shadow-sm ${organizationMeta.cardClassName}`}>
      <h3 className="flex items-center gap-2 px-1 text-[14px] font-normal text-[#222222]">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${organizationMeta.iconClassName}`}>
          <OrganizationIcon aria-hidden className="h-4 w-4" />
        </span>
        {organizationName}
        <span className={`rounded-full px-2 py-0.5 text-[10px] ${organizationMeta.countClassName}`}>
          {preRegistrations.length}명
        </span>
      </h3>
      <div className="mt-2 space-y-1.5">
        {preRegistrations.map((preRegistration, index) => (
          <PendingPreRegistrationRow
            editDraft={editingId === preRegistration.id ? editDraft : null}
            index={index + 1}
            isDeleting={isDeletingId === preRegistration.id}
            isEditing={editingId === preRegistration.id}
            isUpdating={isUpdatingId === preRegistration.id}
            key={preRegistration.id}
            onCancelEdit={onCancelEdit}
            onDelete={() => onDelete(preRegistration)}
            onEdit={() => onEdit(preRegistration)}
            onEditDraftChange={onEditDraftChange}
            onSaveEdit={() => onSaveEdit(preRegistration)}
            positions={positions}
            preRegistration={preRegistration}
          />
        ))}
      </div>
    </section>
  );
}

function PendingPreRegistrationRow({
  editDraft,
  index,
  isDeleting,
  isEditing,
  isUpdating,
  onCancelEdit,
  onDelete,
  onEdit,
  onEditDraftChange,
  onSaveEdit,
  positions,
  preRegistration
}: {
  editDraft: PreRegistrationEditDraft | null;
  index: number;
  isDeleting: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  onCancelEdit: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onEditDraftChange: (nextDraft: Partial<PreRegistrationEditDraft>) => void;
  onSaveEdit: () => void;
  positions: FlatPosition[];
  preRegistration: MemberPreRegistration;
}) {
  const positionName = preRegistration.positionInfo?.name ?? preRegistration.position ?? "직위 미지정";
  const positionBadge = getPositionBadgeMeta(positionName);
  const PositionIcon = positionBadge.icon;
  const dutyName = preRegistration.dutyText
    ?? preRegistration.positionDuty?.name
    ?? preRegistration.positionDuty?.duty
    ?? preRegistration.duty
    ?? "담당 미지정";

  if (isEditing && editDraft) {
    const districtOptions = editDraft.residenceCity ? residenceOptions[editDraft.residenceCity] ?? [] : [];

    return (
      <article className="rounded-[11px] border border-[#B9D7EF] bg-[#F7FBFF] px-2 py-2">
        <div className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-1.5">
          <span className="pt-2 text-center text-[12px] font-normal text-[#416A83]">{index}.</span>
          <div className="min-w-0 space-y-2">
            <div className="grid grid-cols-[minmax(0,1fr)_58px] gap-1.5">
              <input
                className="h-9 rounded-[9px] border border-[#D8D1CE] bg-white px-2 text-[12px] font-normal outline-none"
                onChange={(event) => onEditDraftChange({ name: event.target.value })}
                placeholder="이름"
                value={editDraft.name}
              />
              <input
                className="h-9 rounded-[9px] border border-[#D8D1CE] bg-white px-2 text-[12px] font-normal outline-none"
                min="1"
                onChange={(event) => onEditDraftChange({ age: event.target.value })}
                placeholder="나이"
                type="number"
                value={editDraft.age}
              />
            </div>
            <input
              className="h-9 w-full rounded-[9px] border border-[#D8D1CE] bg-white px-2 text-[12px] font-normal outline-none"
              onChange={(event) => onEditDraftChange({ joinedAt: event.target.value })}
              type="date"
              value={editDraft.joinedAt}
            />
            <div className="grid grid-cols-2 gap-1.5">
              <CustomDropdown
                onChange={(value) => onEditDraftChange({ residenceCity: value, residenceDistrict: "" })}
                options={Object.keys(residenceOptions).map((option) => ({
                  label: option,
                  value: option
                }))}
                placeholder="시"
                value={editDraft.residenceCity}
              />
              <CustomDropdown
                disabled={!editDraft.residenceCity}
                onChange={(value) => onEditDraftChange({ residenceDistrict: value })}
                options={districtOptions.map((option) => ({
                  label: option,
                  value: option
                }))}
                placeholder="구"
                value={editDraft.residenceDistrict}
              />
            </div>
            <input
              className="h-9 w-full rounded-[9px] border border-[#D8D1CE] bg-white px-2 text-[12px] font-normal outline-none"
              inputMode="numeric"
              maxLength={13}
              onChange={(event) => onEditDraftChange({ phoneNumber: formatPhoneInput(event.target.value) })}
              placeholder="번호만 입력해주세요"
              value={editDraft.phoneNumber}
            />
            <div className="grid grid-cols-2 gap-1.5">
              <CustomDropdown
                onChange={(value) => onEditDraftChange({ organization: value })}
                options={organizationOptions.map((option) => ({
                  label: option,
                  value: option
                }))}
                placeholder="소속"
                value={editDraft.organization}
              />
              <CustomDropdown
                onChange={(value) => onEditDraftChange({ positionId: value })}
                options={positions.map((position) => ({
                  depth: position.depth,
                  label: position.name,
                  value: String(position.id)
                }))}
                placeholder="직위"
                value={editDraft.positionId}
              />
            </div>
            <input
              className="h-9 w-full rounded-[9px] border border-[#D8D1CE] bg-white px-2 text-[12px] font-normal outline-none"
              onChange={(event) => onEditDraftChange({ dutyText: event.target.value })}
              placeholder="담당업무"
              value={editDraft.dutyText}
            />
            <div className="flex justify-end gap-1.5">
              <button
                className="h-8 rounded-[8px] border border-[#D8D1CE] bg-white px-3 text-[11px] font-normal text-[#4F4542]"
                onClick={onCancelEdit}
                type="button"
              >
                취소
              </button>
              <button
                className="flex h-8 items-center justify-center gap-1 rounded-[8px] border border-[#B9D7EF] bg-[#D8ECFF] px-3 text-[11px] font-normal text-[#416A83] disabled:opacity-60"
                disabled={isUpdating}
                onClick={onSaveEdit}
                type="button"
              >
                <Save aria-hidden className="h-3.5 w-3.5" />
                {isUpdating ? "저장 중" : "저장"}
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[11px] border border-[#E6DFDC] bg-white px-2 py-2">
      <div className="grid grid-cols-[18px_minmax(0,1fr)_50px] items-start gap-1.5">
        <span className="pt-0.5 text-center text-[12px] font-normal text-[#7B716D]">{index}.</span>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <strong className="break-keep text-[13px] font-normal leading-4 text-[#222222]">{preRegistration.name}</strong>
            <span className={`flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-normal ${positionBadge.className}`}>
              <PositionIcon aria-hidden className="h-2.5 w-2.5" />
              {positionName}
            </span>
          </div>
          <p className="mt-1 break-keep text-[11px] font-normal leading-4 text-[#4F4542]">
            {preRegistration.age ? `${preRegistration.age}세` : "나이 미입력"} · {formatPlainDate(preRegistration.joinedAt)}
          </p>
          <p className="mt-0.5 break-keep text-[11px] font-normal leading-4 text-[#7B716D]">
            {preRegistration.branch ?? "지역 미지정"} · {formatPhoneNumber(preRegistration.phoneNumber)}
          </p>
          <p className="mt-0.5 break-keep text-[11px] font-normal leading-4 text-[#7B716D]">
            {dutyName}
          </p>
        </div>
        <div className="flex justify-end gap-1">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#D8D1CE] bg-[#FFFEFC] text-[#4F4542]"
            onClick={onEdit}
            title="수정"
            type="button"
          >
            <Pencil aria-hidden className="h-3.5 w-3.5" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#F0C5C5] bg-[#FFF1F1] text-[#D95858] disabled:opacity-60"
            disabled={isDeleting}
            onClick={onDelete}
            title="삭제"
            type="button"
          >
            <Trash2 aria-hidden className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
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

function getPreRegistrationOrganizationName(preRegistration: MemberPreRegistration) {
  return preRegistration.organization?.name
    ?? getAffiliationLabel(preRegistration.affiliation);
}

function createEditDraft(preRegistration: MemberPreRegistration): PreRegistrationEditDraft {
  const residence = splitResidence(preRegistration.branch);

  return {
    age: preRegistration.age ? String(preRegistration.age) : "",
    dutyText: preRegistration.dutyText
      ?? preRegistration.positionDuty?.name
      ?? preRegistration.positionDuty?.duty
      ?? preRegistration.duty
      ?? "",
    joinedAt: preRegistration.joinedAt ?? "",
    name: preRegistration.name,
    organization: getPreRegistrationOrganizationName(preRegistration),
    phoneNumber: formatPhoneInput(preRegistration.phoneNumber ?? ""),
    positionId: preRegistration.positionId ? String(preRegistration.positionId) : "",
    residenceCity: residence.city,
    residenceDistrict: residence.district
  };
}

function splitResidence(value: string | null): {
  city: string;
  district: string;
} {
  if (!value) {
    return {
      city: "",
      district: ""
    };
  }

  const matchedCity = Object.keys(residenceOptions).find((city) => value.startsWith(city));
  if (!matchedCity) {
    return {
      city: "",
      district: value
    };
  }

  return {
    city: matchedCity,
    district: value.slice(matchedCity.length).trim()
  };
}

function groupPreRegistrationsByOrganization(preRegistrations: MemberPreRegistration[]) {
  const groupMap = new Map<string, MemberPreRegistration[]>();

  for (const preRegistration of preRegistrations) {
    const organizationName = getPreRegistrationOrganizationName(preRegistration);
    const items = groupMap.get(organizationName) ?? [];

    items.push(preRegistration);
    groupMap.set(organizationName, items);
  }

  return Array.from(groupMap.entries()).map(([organizationName, items]) => ({
    organizationName,
    items
  }));
}

function getOrganizationGroupMeta(organizationName: string): {
  cardClassName: string;
  countClassName: string;
  icon: LucideIcon;
  iconClassName: string;
} {
  if (organizationName.includes("자격증공장")) {
    return {
      cardClassName: "border-[#F0DD96] bg-[#FFFBE8]",
      countClassName: "bg-[#FFF3B8] text-[#9B741B]",
      icon: LibraryBig,
      iconClassName: "bg-[#FFF3B8] text-[#A87928]"
    };
  }

  if (organizationName.includes("수험생")) {
    return {
      cardClassName: "border-[#B9D7EF] bg-[#F3FAFF]",
      countClassName: "bg-[#D8ECFF] text-[#416A83]",
      icon: Building2,
      iconClassName: "bg-[#D8ECFF] text-[#4F6F82]"
    };
  }

  return {
    cardClassName: "border-[#E6DFDC] bg-[#FFFEFC]",
    countClassName: "bg-[#F3F3F3] text-[#6F6662]",
    icon: Building2,
    iconClassName: "bg-[#F3F3F3] text-[#7B716D]"
  };
}

function getPositionBadgeMeta(positionName: string): {
  className: string;
  icon: LucideIcon;
} {
  if (positionName.includes("대표")) {
    return {
      className: "border-[#E6C36A] bg-[#FFF8DB] text-[#9B741B]",
      icon: Crown
    };
  }

  if (positionName.includes("관리자") || positionName.includes("팀장")) {
    return {
      className: "border-[#BFD0F2] bg-[#EEF5FF] text-[#3C67B1]",
      icon: ShieldCheck
    };
  }

  if (positionName.includes("개발")) {
    return {
      className: "border-[#B9D7EF] bg-[#F3FAFF] text-[#416A83]",
      icon: Code2
    };
  }

  if (positionName.includes("공장장")) {
    return {
      className: "border-[#E7C9B2] bg-[#FFF5EF] text-[#A8643B]",
      icon: Building2
    };
  }

  if (positionName.includes("스텝")) {
    return {
      className: "border-[#CFC1EA] bg-[#F7F1FF] text-[#7357A7]",
      icon: ClipboardList
    };
  }

  if (positionName.includes("직원")) {
    return {
      className: "border-[#BFD8CE] bg-[#F0FAF5] text-[#3E8B66]",
      icon: UserRound
    };
  }

  return {
    className: "border-[#D8D1CE] bg-[#F7F7F7] text-[#6F6662]",
    icon: UserRound
  };
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

function formatPlainDate(value: string | null) {
  if (!value) {
    return "입사일 미입력";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).format(date);
}

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatPhoneNumber(value: string | null) {
  if (!value) {
    return "전화번호 미입력";
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return value;
}

export default MemberPreRegisterPage;
