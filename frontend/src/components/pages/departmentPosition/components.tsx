import {
  Check,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { colorSwatches } from "./constants";
import { type DropPlacement, type FlatPosition, type PositionDropPreview } from "./types";
import { getPositionMeta, resolveDropPlacement } from "./utils";

export function ManagementCard({
  children,
  count,
  icon,
  title
}: {
  children: React.ReactNode;
  count: number;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[16px] border border-[#D8D1CE] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[22px] font-normal text-[#222222]">
          {icon}
          {title}
        </h2>
        <span className="rounded-[12px] border border-[#F0C5C5] bg-[#FFF7F7] px-3 py-1.5 text-[14px] font-normal text-[#A24F4F]">
          총 {count}개
        </span>
      </div>
      {children}
    </section>
  );
}

export function RowActions({
  disabled = false,
  iconOnly = false,
  onDelete,
  onEdit
}: {
  disabled?: boolean;
  iconOnly?: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <span className="flex items-center justify-end gap-2 text-[14px] font-normal text-[#222222]">
      <button className="flex items-center gap-1 disabled:opacity-50" disabled={disabled} onClick={onEdit} type="button">
        <Pencil aria-hidden className="h-4 w-4" />
        {iconOnly ? null : "수정"}
      </button>
      <button className="flex items-center gap-1 disabled:opacity-50" disabled={disabled} onClick={onDelete} type="button">
        <Trash2 aria-hidden className="h-4 w-4" />
        {iconOnly ? null : "삭제"}
      </button>
    </span>
  );
}

export function EditActions({
  onCancel,
  onSave
}: {
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <span className="flex items-center justify-end gap-2 text-[#222222]">
      <button aria-label="저장" onClick={onSave} type="button">
        <Check aria-hidden className="h-4 w-4 text-[#2D70CB]" />
      </button>
      <button aria-label="취소" onClick={onCancel} type="button">
        <X aria-hidden className="h-4 w-4 text-[#A24F4F]" />
      </button>
    </span>
  );
}

export function PositionRow({
  disabled,
  draggedPositionId,
  dropPreview,
  index,
  onCancelEdit,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onDelete,
  onEdit,
  onEditDraftChange,
  onSaveEdit,
  position,
  positionEditDraft
}: {
  disabled: boolean;
  draggedPositionId: number | null;
  dropPreview: PositionDropPreview | null;
  index: number;
  onCancelEdit: () => void;
  onDragEnd: () => void;
  onDragOver: (placement: DropPlacement) => void;
  onDragStart: () => void;
  onDrop: (placement: DropPlacement) => void;
  onDelete: () => void;
  onEdit: () => void;
  onEditDraftChange: (name: string) => void;
  onSaveEdit: () => void;
  position: FlatPosition;
  positionEditDraft: { id: number; name: string } | null;
}) {
  const isEditing = Boolean(positionEditDraft);
  const positionName = positionEditDraft?.name ?? position.name;
  const meta = getPositionMeta(positionName, index);
  const PositionIcon = meta.icon;
  const isDragged = draggedPositionId === position.id;
  const isDragTarget = dropPreview?.targetId === position.id && draggedPositionId !== position.id;
  const dropPlacement = isDragTarget ? dropPreview.placement : null;

  return (
    <div
      className={`relative grid grid-cols-[22px_minmax(0,1fr)] items-center gap-1 ${
        isDragged ? "opacity-50" : ""
      }`}
      draggable={!disabled && !isEditing}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver(resolveDropPlacement(event));
      }}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(resolveDropPlacement(event));
      }}
    >
      <GripVertical aria-hidden className="h-5 w-5 cursor-grab text-[#6F6662]" />
      <div
        className={`grid h-[40px] grid-cols-[34px_minmax(0,1fr)_54px_76px] items-center rounded-[12px] border px-2 ${
          dropPlacement === "inside" ? "ring-2 ring-[#2D70CB]/40" : ""
        } ${meta.className}`}
        style={{ marginLeft: `${Math.min(position.depth, 2) * 14}px` }}
      >
        <PositionIcon aria-hidden className={`h-5 w-5 ${meta.iconClassName}`} />
        {isEditing ? (
          <input
            className="min-w-0 rounded-[8px] border border-[#D8D1CE] bg-white px-2 py-1 text-[15px] font-normal outline-none"
            onChange={(event) => onEditDraftChange(event.target.value)}
            value={positionName}
          />
        ) : (
          <span className="truncate text-[18px] font-normal text-[#222222]">{position.name}</span>
        )}
        <span className="text-center text-[12px] font-normal text-[#8D8580]">
          {position.parentId ? "" : "최상위"}
        </span>
        {isEditing ? (
          <EditActions
            onCancel={onCancelEdit}
            onSave={onSaveEdit}
          />
        ) : (
          <RowActions
            disabled={disabled}
            iconOnly
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
      </div>
      {dropPlacement === "before" ? <DropLine label="위에 넣기" /> : null}
      {dropPlacement === "after" ? <DropLine label="아래에 넣기" position="bottom" /> : null}
      {dropPlacement === "inside" ? (
        <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#9FCBFF] bg-white px-2 py-0.5 text-[12px] font-normal text-[#2D70CB] shadow-sm">
          하위로 넣기
        </span>
      ) : null}
    </div>
  );
}

function DropLine({
  label,
  position = "top"
}: {
  label: string;
  position?: "top" | "bottom";
}) {
  return (
    <div
      className={`pointer-events-none absolute left-7 right-1 z-20 flex items-center gap-1 ${
        position === "top" ? "-top-1" : "-bottom-1"
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-[#2D70CB]" />
      <span className="h-[2px] flex-1 rounded-full bg-[#2D70CB]" />
      <span className="rounded-full border border-[#9FCBFF] bg-white px-2 py-0.5 text-[12px] font-normal text-[#2D70CB] shadow-sm">
        {label}
      </span>
    </div>
  );
}

export function AddControl({
  disabled = false,
  onAdd,
  onChange,
  onColorSelect,
  placeholder,
  selectedColorIndex,
  value
}: {
  disabled?: boolean;
  onAdd: () => void;
  onChange: (value: string) => void;
  onColorSelect?: (colorIndex: number) => void;
  placeholder: string;
  selectedColorIndex?: number;
  value: string;
}) {
  return (
    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_84px] items-center gap-2">
      <label className="flex h-11 items-center rounded-[12px] border border-[#D8D1CE] bg-white px-3 shadow-sm">
        <input
          className="min-w-0 flex-1 bg-transparent text-[15px] font-normal outline-none placeholder:text-[#9A918C]"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      </label>
      <button
        className="flex h-11 items-center justify-center gap-1 rounded-[12px] border border-[#9FCBFF] bg-[#EAF4FF] text-[20px] font-normal text-[#2D70CB] shadow-sm disabled:opacity-60"
        disabled={disabled}
        onClick={onAdd}
        type="button"
      >
        <Plus aria-hidden className="h-5 w-5" />
        추가
      </button>
      {onColorSelect ? (
        <div className="col-span-2 flex justify-center gap-3">
          {colorSwatches.map((swatch, index) => {
            const isSelected = selectedColorIndex === index;

            return (
              <button
                aria-label={`색상 ${index + 1} 선택`}
                aria-pressed={isSelected}
                className={`h-5 w-5 rounded-full border shadow-sm ${swatch.dotClassName} ${
                  isSelected ? "border-[#222222] ring-2 ring-[#222222]/20" : "border-black/10"
                }`}
                key={swatch.dotClassName}
                onClick={() => onColorSelect(index)}
                type="button"
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-[#D8D1CE] bg-[#FFFEFC] px-3 py-5 text-center text-[14px] font-normal text-[#7B716D]">
      {label}
    </div>
  );
}
