"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type LucideIcon,
  Building2,
  Check,
  Crown,
  Factory,
  FlaskConical,
  Folder,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Smile,
  Tag,
  Trash2,
  UserRound,
  Wrench,
  X
} from "lucide-react";
import { getOrganizations, type OrganizationOption } from "@/api/member";
import { getPositionTree, type PositionTreeNode } from "@/api/position";

type DepartmentPositionPageProps = {
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

export function DepartmentPositionPage({ onBack }: DepartmentPositionPageProps) {
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getOrganizations(), getPositionTree()])
      .then(([organizationResponse, positionResponse]) => {
        if (!isMounted) {
          return;
        }

        setDepartments(organizationResponse);
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
    () => positions.filter((position) => position.isActive),
    [positions]
  );

  function handleAddDepartment() {
    const nextName = departmentName.trim();
    if (!nextName) {
      setMessage("새 부서 이름을 입력해주세요.");
      return;
    }

    setDepartments((current) => [
      ...current,
      {
        colorIndex: departmentColorIndex,
        id: Date.now(),
        name: nextName
      }
    ]);
    setDepartmentName("");
    setMessage("부서가 화면에 추가되었습니다. 저장 기능은 다음 단계에서 연결됩니다.");
  }

  function handleAddPosition() {
    const nextName = positionName.trim();
    if (!nextName) {
      setMessage("새 직급 이름을 입력해주세요.");
      return;
    }

    setPositions((current) => [
      ...current,
      {
        children: [],
        displayOrder: current.length + 1,
        duties: [],
        dutyOptions: [],
        id: Date.now(),
        isActive: true,
        isAdmin: false,
        isLoginVisible: true,
        name: nextName,
        parentId: null,
        subtitle: null,
        depth: 0
      }
    ]);
    setPositionName("");
    setMessage("직급이 화면에 추가되었습니다. 저장 기능은 다음 단계에서 연결됩니다.");
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

    setDepartments((current) => current.map((department) => (
      department.id === departmentEditDraft.id
        ? {
          ...department,
          colorIndex: departmentEditDraft.colorIndex,
          name: departmentEditDraft.name.trim()
        }
        : department
    )));
    setDepartmentEditDraft(null);
    setMessage("부서가 수정되었습니다. 저장 기능은 다음 단계에서 연결됩니다.");
  }

  function handleDeleteDepartment(id: number) {
    setDepartments((current) => current.filter((department) => department.id !== id));
    if (departmentEditDraft?.id === id) {
      setDepartmentEditDraft(null);
    }
    setMessage("부서가 삭제되었습니다. 저장 기능은 다음 단계에서 연결됩니다.");
  }

  function handleStartPositionEdit(position: FlatPosition) {
    setPositionEditDraft({
      id: position.id,
      name: position.name
    });
  }

  function handleSavePositionEdit() {
    if (!positionEditDraft?.name.trim()) {
      setMessage("직급 이름을 입력해주세요.");
      return;
    }

    setPositions((current) => current.map((position) => (
      position.id === positionEditDraft.id
        ? {
          ...position,
          name: positionEditDraft.name.trim()
        }
        : position
    )));
    setPositionEditDraft(null);
    setMessage("직급이 수정되었습니다. 저장 기능은 다음 단계에서 연결됩니다.");
  }

  function handleDeletePosition(id: number) {
    setPositions((current) => current.filter((position) => position.id !== id));
    if (positionEditDraft?.id === id) {
      setPositionEditDraft(null);
    }
    setMessage("직급이 삭제되었습니다. 저장 기능은 다음 단계에서 연결됩니다.");
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
                index={index}
                key={position.id}
                onCancelEdit={() => setPositionEditDraft(null)}
                onDelete={() => handleDeletePosition(position.id)}
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
            hasSmile
            onAdd={handleAddPosition}
            onChange={setPositionName}
            placeholder="새 직급 이름 입력"
            value={positionName}
          />
        </ManagementCard>

        <section className="rounded-[16px] border border-[#D8D1CE] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <h2 className="flex items-center gap-2 text-[17px] font-normal text-[#222222]">
            <Folder aria-hidden className="h-5 w-5 fill-[#FFE6A8] text-[#8C6B2B]" />
            정렬 안내
          </h2>
          <p className="mt-2 pl-8 text-[12px] font-normal leading-5 text-[#6F6662]">
            직급은 위에서 아래로 상위에서 하위 순으로 정렬됩니다.
            <br />
            손잡이를 드래그해 순서를 변경하세요.
          </p>
        </section>

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
            className="flex h-12 items-center justify-center gap-2 rounded-[13px] border border-[#9FCBFF] bg-[#EAF4FF] text-[18px] font-normal text-[#2D70CB] shadow-sm"
            onClick={() => setMessage("저장 기능은 다음 단계에서 연결됩니다.")}
            type="button"
          >
            <Save aria-hidden className="h-5 w-5" />
            저장하기
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
  iconOnly = false,
  onDelete,
  onEdit
}: {
  iconOnly?: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <span className="flex items-center justify-end gap-2 text-[12px] font-normal text-[#222222]">
      <button className="flex items-center gap-1" onClick={onEdit} type="button">
        <Pencil aria-hidden className="h-4 w-4" />
        {iconOnly ? null : "수정"}
      </button>
      <button className="flex items-center gap-1" onClick={onDelete} type="button">
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
  index,
  onCancelEdit,
  onDelete,
  onEdit,
  onEditDraftChange,
  onSaveEdit,
  position,
  positionEditDraft
}: {
  index: number;
  onCancelEdit: () => void;
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

  return (
    <div className="grid grid-cols-[22px_minmax(0,1fr)] items-center gap-1">
      <GripVertical aria-hidden className="h-5 w-5 text-[#6F6662]" />
      <div className={`grid h-[40px] grid-cols-[34px_minmax(0,1fr)_54px_76px] items-center rounded-[12px] border px-2 ${meta.className}`}>
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
  hasSmile = false,
  onAdd,
  onChange,
  onColorSelect,
  placeholder,
  selectedColorIndex,
  value
}: {
  hasSmile?: boolean;
  onAdd: () => void;
  onChange: (value: string) => void;
  onColorSelect?: (colorIndex: number) => void;
  placeholder: string;
  selectedColorIndex?: number;
  value: string;
}) {
  return (
    <div className="mt-3 grid grid-cols-[minmax(0,1fr)_84px] items-center gap-2">
      <label className="grid h-11 grid-cols-[minmax(0,1fr)_26px] items-center rounded-[12px] border border-[#D8D1CE] bg-white px-3 shadow-sm">
        <input
          className="min-w-0 bg-transparent text-[13px] font-normal outline-none placeholder:text-[#9A918C]"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        {hasSmile ? <Smile aria-hidden className="h-5 w-5 text-[#4F4542]" /> : null}
      </label>
      <button
        className="flex h-11 items-center justify-center gap-1 rounded-[12px] border border-[#9FCBFF] bg-[#EAF4FF] text-[18px] font-normal text-[#2D70CB] shadow-sm"
        onClick={onAdd}
        type="button"
      >
        <Plus aria-hidden className="h-5 w-5" />
        추가
      </button>
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
            onClick={() => onColorSelect?.(index)}
            type="button"
          />
          );
        })}
      </div>
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
