import { type ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Pencil, Save, Trash2 } from "lucide-react";
import { type MemberPreRegistration } from "@/api/member";
import { type PreRegistrationEditDraft, type DropdownOption, type FlatPosition } from "./types";
import {
  formatPlainDate,
  getOrganizationGroupMeta,
  getPositionBadgeMeta,
  organizationOptions
} from "./utils";

export function StepField({
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
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FBE3E8] text-[15px] font-normal text-[#C24D68]">
        {step}
      </span>
      <span className="pt-2 text-[15px] font-normal text-[#4F4542]">{label}</span>
      <span className="min-w-0">
        {children}
        {helper ? (
          <span className="mt-1 block text-[12px] font-normal text-[#9A918D]">{helper}</span>
        ) : null}
      </span>
    </div>
  );
}

export function CustomDropdown({
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
        className={`flex h-10 w-full items-center gap-2 rounded-[10px] border px-3 text-left text-[15px] font-normal outline-none transition ${
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
            <p className="px-3 py-2 text-[14px] font-normal text-[#A69E9A]">선택할 항목이 없습니다.</p>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  className={`flex min-h-8 w-full items-center justify-between gap-2 rounded-[9px] px-2 py-1.5 text-left text-[14px] font-normal transition ${
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

export function PendingPreRegistrationGroup({
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
      <h3 className="flex items-center gap-2 px-1 text-[16px] font-normal text-[#222222]">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${organizationMeta.iconClassName}`}>
          <OrganizationIcon aria-hidden className="h-4 w-4" />
        </span>
        {organizationName}
        <span className={`rounded-full px-2 py-0.5 text-[12px] ${organizationMeta.countClassName}`}>
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
    return (
      <article className="rounded-[11px] border border-[#B9D7EF] bg-[#F7FBFF] px-2 py-2">
        <div className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-1.5">
          <span className="pt-2 text-center text-[14px] font-normal text-[#416A83]">{index}.</span>
          <div className="min-w-0 space-y-2">
            <input
              className="h-9 w-full rounded-[9px] border border-[#D8D1CE] bg-white px-2 text-[14px] font-normal outline-none"
              onChange={(event) => onEditDraftChange({ name: event.target.value })}
              placeholder="이름"
              value={editDraft.name}
            />
            <input
              className="h-9 w-full rounded-[9px] border border-[#D8D1CE] bg-white px-2 text-[14px] font-normal outline-none"
              onChange={(event) => onEditDraftChange({ joinedAt: event.target.value })}
              type="date"
              value={editDraft.joinedAt}
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
              className="h-9 w-full rounded-[9px] border border-[#D8D1CE] bg-white px-2 text-[14px] font-normal outline-none"
              onChange={(event) => onEditDraftChange({ dutyText: event.target.value })}
              placeholder="담당업무"
              value={editDraft.dutyText}
            />
            <div className="flex justify-end gap-1.5">
              <button
                className="h-8 rounded-[8px] border border-[#D8D1CE] bg-white px-3 text-[13px] font-normal text-[#4F4542]"
                onClick={onCancelEdit}
                type="button"
              >
                취소
              </button>
              <button
                className="flex h-8 items-center justify-center gap-1 rounded-[8px] border border-[#B9D7EF] bg-[#D8ECFF] px-3 text-[13px] font-normal text-[#416A83] disabled:opacity-60"
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
        <span className="pt-0.5 text-center text-[14px] font-normal text-[#7B716D]">{index}.</span>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <strong className="break-keep text-[15px] font-normal leading-4 text-[#222222]">{preRegistration.name}</strong>
            <span className={`flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] font-normal ${positionBadge.className}`}>
              <PositionIcon aria-hidden className="h-2.5 w-2.5" />
              {positionName}
            </span>
          </div>
          <p className="mt-1 break-keep text-[13px] font-normal leading-4 text-[#4F4542]">
            {formatPlainDate(preRegistration.joinedAt)}
          </p>
          <p className="mt-0.5 break-keep text-[13px] font-normal leading-4 text-[#7B716D]">
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
