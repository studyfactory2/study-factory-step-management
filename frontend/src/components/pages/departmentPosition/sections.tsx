import { type Dispatch, type SetStateAction } from "react";
import { Building2, Crown } from "lucide-react";
import {
  AddControl,
  EditActions,
  EmptyState,
  ManagementCard,
  PositionRow,
  RowActions
} from "./components";
import { colorSwatches } from "./constants";
import {
  type DepartmentOption,
  type DropPlacement,
  type FlatPosition,
  type PositionDropPreview
} from "./types";
import { getDepartmentMeta } from "./utils";

type DepartmentEditDraft = {
  colorIndex: number;
  id: number;
  name: string;
};

type PositionEditDraft = {
  id: number;
  name: string;
};

export function DepartmentManagementSection({
  departmentColorIndex,
  departmentEditDraft,
  departmentName,
  departments,
  isLoading,
  isSavingDepartments,
  onAddDepartment,
  onDepartmentColorChange,
  onDepartmentNameChange,
  onDeleteDepartment,
  onSaveDepartmentEdit,
  onStartDepartmentEdit,
  setDepartmentEditDraft
}: {
  departmentColorIndex: number;
  departmentEditDraft: DepartmentEditDraft | null;
  departmentName: string;
  departments: DepartmentOption[];
  isLoading: boolean;
  isSavingDepartments: boolean;
  onAddDepartment: () => void;
  onDepartmentColorChange: (colorIndex: number) => void;
  onDepartmentNameChange: (name: string) => void;
  onDeleteDepartment: (id: number) => void;
  onSaveDepartmentEdit: () => void;
  onStartDepartmentEdit: (department: DepartmentOption, index: number) => void;
  setDepartmentEditDraft: Dispatch<SetStateAction<DepartmentEditDraft | null>>;
}) {
  return (
    <ManagementCard
      count={departments.length}
      icon={<Building2 aria-hidden className="h-6 w-6 text-[#4F6F82]" />}
      title="부서 관리"
    >
      <div className="space-y-2">
        {isLoading ? <EmptyState label="부서를 불러오는 중입니다." /> : null}
        {!isLoading && departments.map((department, index) => {
          const isEditing = departmentEditDraft?.id === department.id;
          const displayName = isEditing ? departmentEditDraft.name : department.name;
          const displayColorIndex = isEditing ? departmentEditDraft.colorIndex : department.colorIndex;
          const meta = getDepartmentMeta(displayName, index, displayColorIndex);
          const DepartmentIcon = meta.icon;

          return (
            <div
              className={`grid grid-cols-[36px_minmax(0,1fr)_104px] items-center rounded-[13px] border px-2 ${
                isEditing ? "min-h-[72px] py-2" : "h-[46px]"
              } ${meta.className}`}
              key={department.id}
            >
              <span className="flex h-8 w-8 items-center justify-center">
                <DepartmentIcon aria-hidden className="h-6 w-6" />
              </span>
              {isEditing ? (
                <input
                  className="min-w-0 rounded-[8px] border border-[#D8D1CE] bg-white px-2 py-1 text-[15px] font-normal outline-none"
                  onChange={(event) => setDepartmentEditDraft((current) => current ? {
                    ...current,
                    name: event.target.value
                  } : current)}
                  value={departmentEditDraft.name}
                />
              ) : (
                <span className="truncate text-[17px] font-normal text-[#222222]">{department.name}</span>
              )}
              {isEditing ? (
                <EditActions
                  onCancel={() => setDepartmentEditDraft(null)}
                  onSave={onSaveDepartmentEdit}
                />
              ) : (
                <RowActions
                  disabled={isSavingDepartments}
                  onDelete={() => onDeleteDepartment(department.id)}
                  onEdit={() => onStartDepartmentEdit(department, index)}
                />
              )}
              {isEditing ? (
                <div className="col-span-3 mt-1 flex justify-center gap-2">
                  {colorSwatches.map((swatch, colorIndex) => {
                    const isSelected = departmentEditDraft.colorIndex === colorIndex;

                    return (
                      <button
                        aria-label={`부서 색상 ${colorIndex + 1} 선택`}
                        aria-pressed={isSelected}
                        className={`h-4 w-4 rounded-full border shadow-sm ${swatch.dotClassName} ${
                          isSelected ? "border-[#222222] ring-2 ring-[#222222]/20" : "border-black/10"
                        }`}
                        key={swatch.dotClassName}
                        onClick={() => setDepartmentEditDraft((current) => current ? {
                          ...current,
                          colorIndex
                        } : current)}
                        type="button"
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <AddControl
        disabled={isSavingDepartments}
        onAdd={onAddDepartment}
        onChange={onDepartmentNameChange}
        onColorSelect={onDepartmentColorChange}
        placeholder="새 부서 이름 입력"
        selectedColorIndex={departmentColorIndex}
        value={departmentName}
      />
    </ManagementCard>
  );
}

export function PositionManagementSection({
  draggedPositionId,
  isLoading,
  isSavingPositions,
  onAddPosition,
  onCancelPositionEdit,
  onDeletePosition,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onPositionNameChange,
  onSavePositionEdit,
  onStartPositionEdit,
  positionDropPreview,
  positionEditDraft,
  positionName,
  setPositionEditDraft,
  visiblePositions
}: {
  draggedPositionId: number | null;
  isLoading: boolean;
  isSavingPositions: boolean;
  onAddPosition: () => void;
  onCancelPositionEdit: () => void;
  onDeletePosition: (id: number) => void;
  onDragEnd: () => void;
  onDragOver: (positionId: number, placement: DropPlacement) => void;
  onDragStart: (positionId: number) => void;
  onDrop: (positionId: number, placement: DropPlacement) => void;
  onPositionNameChange: (name: string) => void;
  onSavePositionEdit: () => void;
  onStartPositionEdit: (position: FlatPosition) => void;
  positionDropPreview: PositionDropPreview | null;
  positionEditDraft: PositionEditDraft | null;
  positionName: string;
  setPositionEditDraft: Dispatch<SetStateAction<PositionEditDraft | null>>;
  visiblePositions: FlatPosition[];
}) {
  return (
    <ManagementCard
      count={visiblePositions.length}
      icon={<Crown aria-hidden className="h-6 w-6 fill-[#FFE184] text-[#8E6B22]" />}
      title="직급 관리"
    >
      <div className="max-h-[340px] space-y-1.5 overflow-y-auto pr-1">
        {isLoading ? <EmptyState label="직급을 불러오는 중입니다." /> : null}
        {!isLoading && visiblePositions.map((position, index) => (
          <PositionRow
            draggedPositionId={draggedPositionId}
            dropPreview={positionDropPreview}
            index={index}
            key={position.id}
            onCancelEdit={onCancelPositionEdit}
            onDragEnd={onDragEnd}
            onDragOver={(placement) => onDragOver(position.id, placement)}
            onDragStart={() => onDragStart(position.id)}
            onDrop={(placement) => onDrop(position.id, placement)}
            onDelete={() => onDeletePosition(position.id)}
            disabled={isSavingPositions}
            onEdit={() => onStartPositionEdit(position)}
            onEditDraftChange={(name) => setPositionEditDraft((current) => current ? {
              ...current,
              name
            } : current)}
            onSaveEdit={onSavePositionEdit}
            position={position}
            positionEditDraft={positionEditDraft?.id === position.id ? positionEditDraft : null}
          />
        ))}
      </div>

      <AddControl
        disabled={isSavingPositions}
        onAdd={onAddPosition}
        onChange={onPositionNameChange}
        placeholder="새 직급 이름 입력"
        value={positionName}
      />
    </ManagementCard>
  );
}
