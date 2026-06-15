"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Save, Tag } from "lucide-react";
import { getOrganizations, updateOrganizations } from "@/api/member";
import {
  createPosition,
  deletePosition,
  getPositionTree,
  updatePosition,
  updatePositionTree
} from "@/api/position";
import {
  type DepartmentOption,
  type DropPlacement,
  type FlatPosition,
  type PositionDropPreview
} from "@/components/pages/departmentPosition/types";
import {
  DepartmentManagementSection,
  PositionManagementSection
} from "@/components/pages/departmentPosition/sections";
import {
  buildVisiblePositionTree,
  flattenPositions,
  isPositionDescendant,
  isTemporaryDepartmentId,
  movePositionDraft,
  resolveDepartmentColorIndex
} from "@/components/pages/departmentPosition/utils";


type DepartmentPositionPageProps = {
  accessToken: string;
  onBack: () => void;
};

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
  const [positionDropPreview, setPositionDropPreview] = useState<PositionDropPreview | null>(null);
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

  function handlePositionDrop(targetPositionId: number, placement: DropPlacement) {
    if (!draggedPositionId || draggedPositionId === targetPositionId) {
      setDraggedPositionId(null);
      setPositionDropPreview(null);
      return;
    }

    if (isPositionDescendant(targetPositionId, draggedPositionId, positions)) {
      setMessage("자기 하위 직급 아래로는 이동할 수 없습니다.");
      setDraggedPositionId(null);
      setPositionDropPreview(null);
      return;
    }

    setPositions((current) => movePositionDraft(current, draggedPositionId, targetPositionId, placement));
    setDraggedPositionId(null);
    setPositionDropPreview(null);
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

        <DepartmentManagementSection
          departmentColorIndex={departmentColorIndex}
          departmentEditDraft={departmentEditDraft}
          departmentName={departmentName}
          departments={departments}
          isLoading={isLoading}
          isSavingDepartments={isSavingDepartments}
          onAddDepartment={handleAddDepartment}
          onDepartmentColorChange={setDepartmentColorIndex}
          onDepartmentNameChange={setDepartmentName}
          onDeleteDepartment={handleDeleteDepartment}
          onSaveDepartmentEdit={handleSaveDepartmentEdit}
          onStartDepartmentEdit={handleStartDepartmentEdit}
          setDepartmentEditDraft={setDepartmentEditDraft}
        />

        <PositionManagementSection
          draggedPositionId={draggedPositionId}
          isLoading={isLoading}
          isSavingPositions={isSavingPositions}
          onAddPosition={handleAddPosition}
          onCancelPositionEdit={() => setPositionEditDraft(null)}
          onDeletePosition={handleDeletePosition}
          onDragEnd={() => {
            setDraggedPositionId(null);
            setPositionDropPreview(null);
          }}
          onDragOver={(positionId, placement) => setPositionDropPreview({
            placement,
            targetId: positionId
          })}
          onDragStart={setDraggedPositionId}
          onDrop={handlePositionDrop}
          onPositionNameChange={setPositionName}
          onSavePositionEdit={handleSavePositionEdit}
          onStartPositionEdit={handleStartPositionEdit}
          positionDropPreview={positionDropPreview}
          positionEditDraft={positionEditDraft}
          positionName={positionName}
          setPositionEditDraft={setPositionEditDraft}
          visiblePositions={visiblePositions}
        />

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

export default DepartmentPositionPage;
