"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type LucideIcon,
  Building2,
  Check,
  Crown,
  Factory,
  FlaskConical,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Tag,
  Trash2,
  UserRound,
  Wrench,
  X
} from "lucide-react";
import { getOrganizations, updateOrganizations, type OrganizationOption } from "@/api/member";
import {
  createPosition,
  deletePosition,
  getPositionTree,
  updatePosition,
  updatePositionTree,
  type PositionTreeNode
} from "@/api/position";

type DepartmentPositionPageProps = {
  accessToken: string;
  onBack: () => void;
};

type FlatPosition = PositionTreeNode & {
  depth: number;
};

type DepartmentOption = OrganizationOption & {
  colorIndex?: number;
};

const colorSwatches = [
  {
    dotClassName: "bg-[#FFA3A3]",
    rowClassName: "border-[#F0C5C5] bg-[#FFF1F1]"
  },
  {
    dotClassName: "bg-[#FFD979]",
    rowClassName: "border-[#F0DD96] bg-[#FFF9D9]"
  },
  {
    dotClassName: "bg-[#9FCBFF]",
    rowClassName: "border-[#B9D7EF] bg-[#F3FAFF]"
  },
  {
    dotClassName: "bg-[#A8E3AF]",
    rowClassName: "border-[#BFD8CE] bg-[#F0FAF5]"
  },
  {
    dotClassName: "bg-[#B99BEF]",
    rowClassName: "border-[#D2C3F0] bg-[#F4EEFF]"
  }
];

export function DepartmentPositionPage({ accessToken, onBack }: DepartmentPositionPageProps) {
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [positions, setPositions] = useState<FlatPosition[]>([]);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentColorIndex, setDepartmentColorIndex] = useState(0);
  const [departmentEditDraft, setDepartmentEditDraft] = useState<{
    colorIndex: number;
    id: number;
    name: string;
  } | null>(null);
  const [positionName, setPositionName] = useState("");
  const [positionEditDraft, setPositionEditDraft] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [draggedPositionId, setDraggedPositionId] = useState<number | null>(null);
  const [dragOverPositionId, setDragOverPositionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDepartments, setIsSavingDepartments] = useState(false);
  const [isSavingPositions, setIsSavingPositions] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getOrganizations(), getPositionTree()])
      .then(([organizationResponse, positionResponse]) => {
        if (!isMounted) {
          return;
        }

        setDepartments(organizationResponse.map((organization, index) => ({
          ...organization,
          colorIndex: organization.colorIndex ?? resolveDepartmentColorIndex(organization.name, index)
        })));
        setPositions(flattenPositions(positionResponse));
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setMessage(error instanceof Error ? error.message : "부서와 직급 정보를 불러오지 못했습니다.");
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

  const visiblePositions = useMemo(
    () => buildVisiblePositionTree(positions),
    [positions]
  );

  function handleAddDepartment() {
    const nextName = departmentName.trim();
    if (!nextName) {
      setMessage("새 부서 이름을 입력해주세요.");
      return;
    }

    const nextDepartments = [
      ...departments,
      {
        colorIndex: departmentColorIndex,
        id: Date.now(),
        name: nextName
      }
    ];

    setDepartments(nextDepartments);
    setDepartmentName("");
    void persistDepartments(nextDepartments, "부서가 추가되었습니다.");
  }

  async function refreshPositions() {
    const positionResponse = await getPositionTree();

    setPositions(flattenPositions(positionResponse));
  }

  async function handleAddPosition() {
    const nextName = positionName.trim();
    if (!nextName) {
      setMessage("새 직급 이름을 입력해주세요.");
      return;
    }

    setIsSavingPositions(true);
    setMessage("");

    try {
      await createPosition(accessToken, {
        isAdmin: false,
        isLoginVisible: true,
        name: nextName
      });
      await refreshPositions();
      setPositionName("");
      setMessage("직급이 추가되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "직급을 추가하지 못했습니다.");
    } finally {
      setIsSavingPositions(false);
    }
  }

  function handleStartDepartmentEdit(department: DepartmentOption, index: number) {
    setDepartmentEditDraft({
      colorIndex: department.colorIndex ?? resolveDepartmentColorIndex(department.name, index),
      id: department.id,
      name: department.name
    });
  }

  function handleSaveDepartmentEdit() {
    if (!departmentEditDraft?.name.trim()) {
      setMessage("부서 이름을 입력해주세요.");
      return;
    }

    const nextDepartments = departments.map((department) => (
      department.id === departmentEditDraft.id
        ? {
          ...department,
          colorIndex: departmentEditDraft.colorIndex,
          name: departmentEditDraft.name.trim()
        }
        : department
    ));

    setDepartments(nextDepartments);
    void persistDepartments(nextDepartments, "부서가 수정되었습니다.");
  }

  function handleDeleteDepartment(id: number) {
    const nextDepartments = departments.filter((department) => department.id !== id);

    setDepartments(nextDepartments);
    if (departmentEditDraft?.id === id) {
      setDepartmentEditDraft(null);
    }
    void persistDepartments(nextDepartments, "부서가 삭제되었습니다.");
  }

  function handleStartPositionEdit(position: FlatPosition) {
    setPositionEditDraft({
      id: position.id,
      name: position.name
    });
  }

  async function handleSavePositionEdit() {
    if (!positionEditDraft?.name.trim()) {
      setMessage("직급 이름을 입력해주세요.");
      return;
    }

    setIsSavingPositions(true);
    setMessage("");

    try {
      await updatePosition(accessToken, positionEditDraft.id, {
        name: positionEditDraft.name.trim()
      });
      await refreshPositions();
      setPositionEditDraft(null);
      setMessage("직급이 수정되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "직급을 수정하지 못했습니다.");
    } finally {
      setIsSavingPositions(false);
    }
  }

  async function handleDeletePosition(id: number) {
    setIsSavingPositions(true);
    setMessage("");

    try {
      await deletePosition(accessToken, id);
      await refreshPositions();
      if (positionEditDraft?.id === id) {
        setPositionEditDraft(null);
      }
      setMessage("직급이 삭제되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "직급을 삭제하지 못했습니다.");
    } finally {
      setIsSavingPositions(false);
    }
  }

  async function persistDepartments(nextDepartments: DepartmentOption[], successMessage: string) {
    setIsSavingDepartments(true);
    setMessage("");

    try {
      const savedOrganizations = await updateOrganizations(accessToken, {
        organizations: nextDepartments.map((department, index) => ({
          colorIndex: department.colorIndex ?? resolveDepartmentColorIndex(department.name, index),
          displayOrder: index,
          id: isTemporaryDepartmentId(department.id) ? undefined : department.id,
          name: department.name
        }))
      });

      setDepartments(savedOrganizations.map((organization, index) => ({
        ...organization,
        colorIndex: organization.colorIndex ?? resolveDepartmentColorIndex(organization.name, index)
      })));
      setDepartmentEditDraft(null);
      setMessage(successMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "부서 정보를 저장하지 못했습니다.");
    } finally {
      setIsSavingDepartments(false);
    }
  }

  function handlePositionDrop(targetPositionId: number) {
    if (!draggedPositionId || draggedPositionId === targetPositionId) {
      setDraggedPositionId(null);
      setDragOverPositionId(null);
      return;
    }

    if (isPositionDescendant(targetPositionId, draggedPositionId, positions)) {
      setMessage("자기 하위 직급 아래로는 이동할 수 없습니다.");
      setDraggedPositionId(null);
      setDragOverPositionId(null);
      return;
    }

    setPositions((current) => current.map((position) => (
      position.id === draggedPositionId
        ? {
          ...position,
          parentId: targetPositionId
        }
        : position
    )));
    setDraggedPositionId(null);
    setDragOverPositionId(null);
    setMessage("직급 상하관계가 변경되었습니다. 저장하기를 눌러 반영해주세요.");
  }

  async function handleSavePositionOrder() {
    setIsSavingPositions(true);
    setMessage("");

    try {
      await updatePositionTree(accessToken, {
        positions: positions
          .filter((position) => position.isActive)
          .map((position, index) => ({
            displayOrder: index,
            id: position.id,
            parentId: position.parentId
          }))
      });
      await refreshPositions();
      setMessage("직급 상하관계가 저장되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "직급 상하관계를 저장하지 못했습니다.");
    } finally {
      setIsSavingPositions(false);
    }
  }

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="mx-auto w-full max-w-[360px] space-y-3">
        <header className="relative pb-1 text-center">
          <button
            className="absolute left-0 top-0 h-8 rounded-[12px] border border-[#D8D1CE] bg-[#F7F7F7] px-3 text-[12px] font-normal text-[#333333] shadow-sm"
            onClick={onBack}
            type="button"
          >
            ← 뒤로가기
          </button>
          <h1 className="flex items-center justify-center gap-2 text-[22px] font-normal text-[#111111]">
            <Tag aria-hidden className="h-6 w-6 rotate-[-10deg] fill-[#FFE2A6] text-[#4F4542]" />
            부서/직급관리
          </h1>
        </header>

        {message ? (
          <div className="rounded-[12px] border border-[#F0C5C5] bg-[#FFF8F8] px-3 py-2 text-[11px] font-normal text-[#A24F4F]">
            {message}
          </div>
        ) : null}

        <ManagementCard
          count={departments.length}
          icon={<Building2 aria-hidden className="h-6 w-6 text-[#4F6F82]" />}
          title="부서 관리"
        >
          <div className="space-y-2">
            {isLoading ? (
              <EmptyState label="부서를 불러오는 중입니다." />
            ) : null}
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
                      className="min-w-0 rounded-[8px] border border-[#D8D1CE] bg-white px-2 py-1 text-[13px] font-normal outline-none"
                      onChange={(event) => setDepartmentEditDraft((current) => current ? {
                        ...current,
                        name: event.target.value
                      } : current)}
                      value={departmentEditDraft.name}
                    />
                  ) : (
                    <span className="truncate text-[15px] font-normal text-[#222222]">{department.name}</span>
                  )}
                  {isEditing ? (
                    <EditActions
                      onCancel={() => setDepartmentEditDraft(null)}
                      onSave={handleSaveDepartmentEdit}
                    />
                  ) : (
                    <RowActions
                      disabled={isSavingDepartments}
                      onDelete={() => handleDeleteDepartment(department.id)}
                      onEdit={() => handleStartDepartmentEdit(department, index)}
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
            onAdd={handleAddDepartment}
            onChange={setDepartmentName}
            onColorSelect={setDepartmentColorIndex}
            placeholder="새 부서 이름 입력"
            selectedColorIndex={departmentColorIndex}
            value={departmentName}
          />
        </ManagementCard>

        <ManagementCard
          count={visiblePositions.length}
          icon={<Crown aria-hidden className="h-6 w-6 fill-[#FFE184] text-[#8E6B22]" />}
          title="직급 관리"
        >
          <div className="max-h-[340px] space-y-1.5 overflow-y-auto pr-1">
            {isLoading ? (
              <EmptyState label="직급을 불러오는 중입니다." />
            ) : null}
            {!isLoading && visiblePositions.map((position, index) => (
              <PositionRow
                dragOverPositionId={dragOverPositionId}
                draggedPositionId={draggedPositionId}
                index={index}
                key={position.id}
                onCancelEdit={() => setPositionEditDraft(null)}
                onDragEnd={() => {
                  setDraggedPositionId(null);
                  setDragOverPositionId(null);
                }}
                onDragEnter={() => setDragOverPositionId(position.id)}
                onDragStart={() => setDraggedPositionId(position.id)}
                onDrop={() => handlePositionDrop(position.id)}
                onDelete={() => handleDeletePosition(position.id)}
                disabled={isSavingPositions}
                onEdit={() => handleStartPositionEdit(position)}
                onEditDraftChange={(name) => setPositionEditDraft((current) => current ? {
                  ...current,
                  name
                } : current)}
                onSaveEdit={handleSavePositionEdit}
                position={position}
                positionEditDraft={positionEditDraft?.id === position.id ? positionEditDraft : null}
              />
            ))}
          </div>

          <AddControl
            disabled={isSavingPositions}
            onAdd={handleAddPosition}
            onChange={setPositionName}
            placeholder="새 직급 이름 입력"
            value={positionName}
          />
        </ManagementCard>

        <div className="grid grid-cols-[1fr_1.25fr] gap-2 pb-4">
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-[13px] border border-[#D8D1CE] bg-white text-[18px] font-normal text-[#4F4542] shadow-sm"
            onClick={() => setMessage("초기화 기능은 다음 단계에서 연결됩니다.")}
            type="button"
          >
            <RefreshCw aria-hidden className="h-5 w-5" />
            초기화
          </button>
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-[13px] border border-[#9FCBFF] bg-[#EAF4FF] text-[18px] font-normal text-[#2D70CB] shadow-sm disabled:opacity-60"
            disabled={isSavingPositions}
            onClick={handleSavePositionOrder}
            type="button"
          >
            <Save aria-hidden className="h-5 w-5" />
            {isSavingPositions ? "저장 중" : "저장하기"}
          </button>
        </div>
      </div>
    </main>
  );
}

function ManagementCard({
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
        <h2 className="flex items-center gap-2 text-[20px] font-normal text-[#222222]">
          {icon}
          {title}
        </h2>
        <span className="rounded-[12px] border border-[#F0C5C5] bg-[#FFF7F7] px-3 py-1.5 text-[12px] font-normal text-[#A24F4F]">
          총 {count}개
        </span>
      </div>
      {children}
    </section>
  );
}

function RowActions({
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
    <span className="flex items-center justify-end gap-2 text-[12px] font-normal text-[#222222]">
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

function EditActions({
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

function PositionRow({
  disabled,
  draggedPositionId,
  dragOverPositionId,
  index,
  onCancelEdit,
  onDragEnd,
  onDragEnter,
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
  dragOverPositionId: number | null;
  index: number;
  onCancelEdit: () => void;
  onDragEnd: () => void;
  onDragEnter: () => void;
  onDragStart: () => void;
  onDrop: () => void;
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
  const isDragTarget = dragOverPositionId === position.id && draggedPositionId !== position.id;

  return (
    <div
      className={`grid grid-cols-[22px_minmax(0,1fr)] items-center gap-1 ${isDragged ? "opacity-50" : ""}`}
      draggable={!disabled && !isEditing}
      onDragEnd={onDragEnd}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragEnter();
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
    >
      <GripVertical aria-hidden className="h-5 w-5 cursor-grab text-[#6F6662]" />
      <div
        className={`grid h-[40px] grid-cols-[34px_minmax(0,1fr)_54px_76px] items-center rounded-[12px] border px-2 ${
          isDragTarget ? "ring-2 ring-[#2D70CB]/30" : ""
        } ${meta.className}`}
        style={{ marginLeft: `${Math.min(position.depth, 2) * 14}px` }}
      >
        <PositionIcon aria-hidden className={`h-5 w-5 ${meta.iconClassName}`} />
        {isEditing ? (
          <input
            className="min-w-0 rounded-[8px] border border-[#D8D1CE] bg-white px-2 py-1 text-[13px] font-normal outline-none"
            onChange={(event) => onEditDraftChange(event.target.value)}
            value={positionName}
          />
        ) : (
          <span className="truncate text-[16px] font-normal text-[#222222]">{position.name}</span>
        )}
        <span className="text-center text-[10px] font-normal text-[#8D8580]">
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
    </div>
  );
}

function AddControl({
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
          className="min-w-0 flex-1 bg-transparent text-[13px] font-normal outline-none placeholder:text-[#9A918C]"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      </label>
      <button
        className="flex h-11 items-center justify-center gap-1 rounded-[12px] border border-[#9FCBFF] bg-[#EAF4FF] text-[18px] font-normal text-[#2D70CB] shadow-sm disabled:opacity-60"
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

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-[#D8D1CE] bg-[#FFFEFC] px-3 py-5 text-center text-[12px] font-normal text-[#7B716D]">
      {label}
    </div>
  );
}

function getDepartmentMeta(name: string, index: number, colorIndex?: number): {
  className: string;
  icon: LucideIcon;
} {
  if (typeof colorIndex === "number") {
    return {
      className: colorSwatches[colorIndex]?.rowClassName ?? colorSwatches[0].rowClassName,
      icon: Building2
    };
  }

  if (name.includes("자격증")) {
    return {
      className: "border-[#F0C5C5] bg-[#FFF1F1]",
      icon: Factory
    };
  }

  if (name.includes("수험생")) {
    return {
      className: "border-[#B9D7EF] bg-[#F3FAFF]",
      icon: Building2
    };
  }

  return {
    className: colorSwatches[(index + 1) % colorSwatches.length].rowClassName,
    icon: Building2
  };
}

function resolveDepartmentColorIndex(name: string, index: number) {
  if (name.includes("자격증")) {
    return 0;
  }

  if (name.includes("수험생")) {
    return 2;
  }

  return (index + 1) % colorSwatches.length;
}

function isTemporaryDepartmentId(id: number) {
  return id > 1_000_000_000_000;
}

function buildVisiblePositionTree(positions: FlatPosition[]): FlatPosition[] {
  const activeNonAdminPositions = positions
    .filter((position) => position.isActive && !position.isAdmin)
    .sort((left, right) => left.displayOrder - right.displayOrder || left.id - right.id);
  const visibleIdSet = new Set(activeNonAdminPositions.map((position) => position.id));
  const childrenByParentId = new Map<number | null, FlatPosition[]>();
  const visiblePositions: FlatPosition[] = [];

  for (const position of activeNonAdminPositions) {
    const parentId = position.parentId && visibleIdSet.has(position.parentId)
      ? position.parentId
      : null;
    const siblings = childrenByParentId.get(parentId) ?? [];

    siblings.push(position);
    childrenByParentId.set(parentId, siblings);
  }

  function visit(parentId: number | null, depth: number) {
    const children = childrenByParentId.get(parentId) ?? [];

    for (const child of children) {
      visiblePositions.push({
        ...child,
        depth
      });
      visit(child.id, depth + 1);
    }
  }

  visit(null, 0);

  return visiblePositions;
}

function isPositionDescendant(targetId: number, parentId: number, positions: FlatPosition[]): boolean {
  const target = positions.find((position) => position.id === targetId);
  if (!target?.parentId) {
    return false;
  }

  if (target.parentId === parentId) {
    return true;
  }

  return isPositionDescendant(target.parentId, parentId, positions);
}

function getPositionMeta(name: string, index: number): {
  className: string;
  icon: LucideIcon;
  iconClassName: string;
} {
  if (name.includes("대표") || name.includes("소장") || name.includes("공장장")) {
    return {
      className: "border-[#F0C5C5] bg-[#FFF1F1]",
      icon: Crown,
      iconClassName: "fill-[#FFE184] text-[#8E6B22]"
    };
  }

  if (name.includes("연구")) {
    return {
      className: "border-[#F0DD96] bg-[#FFF9D9]",
      icon: FlaskConical,
      iconClassName: "text-[#5E9A70]"
    };
  }

  if (name.includes("스텝") || name.includes("개발")) {
    return {
      className: "border-[#F0DD96] bg-[#FFF9D9]",
      icon: Wrench,
      iconClassName: "text-[#6F6662]"
    };
  }

  if (name.includes("직원")) {
    return {
      className: "border-[#B9D7EF] bg-[#F3FAFF]",
      icon: UserRound,
      iconClassName: "fill-[#7D93A6] text-[#4F6F82]"
    };
  }

  const classes = [
    "border-[#F0C5C5] bg-[#FFF1F1]",
    "border-[#F0DD96] bg-[#FFF9D9]",
    "border-[#B9D7EF] bg-[#F3FAFF]"
  ];

  return {
    className: classes[index % classes.length],
    icon: UserRound,
    iconClassName: "text-[#4F6F82]"
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

export default DepartmentPositionPage;
