import {
  type DragEvent,
  FormEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { Plus, X } from "lucide-react";
import {
  createPosition,
  deletePosition,
  getPositionTree,
  type PositionTreeNode,
  updatePositionTree
} from "@/api/position";
import { cn } from "@/util/utils";

type PositionTreeManagementPanelProps = {
  accessToken: string;
  onClose: () => void;
  onMessage: (message: string) => void;
};

type DragPreview = {
  name: string;
  subtitle: string | null;
  x: number;
  y: number;
};

function getPositionIdFromPoint(x: number, y: number): number | null {
  const targetElement = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-position-id]");
  const targetId = Number(targetElement?.dataset.positionId);

  return Number.isFinite(targetId) ? targetId : null;
}

export function PositionTreeManagementPanel({
  accessToken,
  onClose,
  onMessage
}: PositionTreeManagementPanelProps) {
  const [positions, setPositions] = useState<PositionTreeNode[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTargetId, setDropTargetId] = useState<number | null>(null);
  const [pointerDraggingId, setPointerDraggingId] = useState<number | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [duty, setDuty] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PositionTreeNode | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const flatPositions = useMemo(() => flattenPositions(positions), [positions]);
  const draggingPosition = flatPositions.find((position) => position.id === draggingId);
  const dropTargetPosition = flatPositions.find((position) => position.id === dropTargetId);

  const refreshPositions = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getPositionTree();
      setPositions(response);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "로그인 화면 조직도를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [onMessage]);

  useEffect(() => {
    void refreshPositions();
  }, [refreshPositions]);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (pointerDraggingId !== null) {
        event.preventDefault();
        const targetId = getPositionIdFromPoint(event.clientX, event.clientY);
        setDropTargetId(targetId !== null && targetId !== pointerDraggingId ? targetId : null);
      }

      setDragPreview((preview) =>
        preview
          ? {
              ...preview,
              x: event.clientX,
              y: event.clientY
            }
          : null
      );
    }

    function handlePointerUp(event: PointerEvent) {
      if (pointerDraggingId !== null) {
        event.preventDefault();
        const targetId = getPositionIdFromPoint(event.clientX, event.clientY);

        if (targetId !== null && targetId !== pointerDraggingId) {
          void handleDrop(targetId, pointerDraggingId);
          return;
        }
      }

      setPointerDraggingId(null);
      setDraggingId(null);
      setDropTargetId(null);
      setDragPreview(null);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp, { passive: false });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
    // Drag listeners only need to rebind when touch dragging starts or ends.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointerDraggingId]);

  function resetCreateForm() {
    setName("");
    setSubtitle("");
    setDuty("");
    setParentId("");
    setIsLoginVisible(true);
    setIsAdmin(false);
  }

  function handleOpenCreateModal() {
    resetCreateForm();
    setIsCreateModalOpen(true);
  }

  function handleCloseCreateModal() {
    resetCreateForm();
    setIsCreateModalOpen(false);
  }

  async function handleCreatePosition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      await createPosition(accessToken, {
        name,
        subtitle: subtitle || undefined,
        duty: duty || undefined,
        parentId: parentId === "" ? null : parentId,
        isLoginVisible,
        isAdmin
      });
      resetCreateForm();
      setIsCreateModalOpen(false);
      onMessage("직위가 추가되었습니다.");
      await refreshPositions();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "직위를 추가하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleParentChange(positionId: number, nextParentId: number | null) {
    if (positionId === nextParentId) {
      return;
    }

    const movingPosition = flatPositions.find((position) => position.id === positionId);
    const nextParentPosition = nextParentId
      ? flatPositions.find((position) => position.id === nextParentId)
      : null;

    if (movingPosition?.isAdmin) {
      onMessage("관리자는 직위를 설정할 수 없습니다.");
      return;
    }

    if (!movingPosition || nextParentPosition?.ancestorIds.includes(positionId)) {
      onMessage("하위 직위를 상위 직위로 지정할 수 없습니다.");
      return;
    }

    const nextPositions = movePositionToParent(positions, positionId, nextParentId);
    setPositions(nextPositions);
    setIsSaving(true);

    try {
      const updatedTree = await updatePositionTree(accessToken, {
        positions: flattenTreeForUpdate(nextPositions)
      });
      setPositions(updatedTree);
      onMessage("상위 직위가 변경되었습니다.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "상위 직위를 변경하지 못했습니다.");
      await refreshPositions();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePosition() {
    if (!deleteTarget) {
      return;
    }

    setDeleteErrorMessage("");
    setIsSaving(true);

    try {
      await deletePosition(accessToken, deleteTarget.id);
      setDeleteTarget(null);
      onMessage("직위가 삭제되었습니다.");
      await refreshPositions();
    } catch (error) {
      setDeleteErrorMessage(error instanceof Error ? error.message : "직위를 삭제하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDrop(parentIdToApply: number | null, movingId = draggingId) {
    if (movingId === null || parentIdToApply === movingId) {
      setDraggingId(null);
      setDropTargetId(null);
      setDragPreview(null);
      return;
    }

    const draggedPosition = flatPositions.find((position) => position.id === movingId);
    const targetPosition = parentIdToApply
      ? flatPositions.find((position) => position.id === parentIdToApply)
      : null;

    if (draggedPosition?.isAdmin) {
      setDraggingId(null);
      setDropTargetId(null);
      setDragPreview(null);
      onMessage("관리자는 직위를 설정할 수 없습니다.");
      return;
    }

    if (!draggedPosition || targetPosition?.ancestorIds.includes(movingId)) {
      setDraggingId(null);
      setDropTargetId(null);
      setDragPreview(null);
      onMessage("하위 직위를 상위 직위로 지정할 수 없습니다.");
      return;
    }

    const nextPositions = movePositionToParent(positions, movingId, parentIdToApply);
    setPositions(nextPositions);
    setDraggingId(null);
    setDropTargetId(null);
    setDragPreview(null);
    setIsSaving(true);

    try {
      const updatedTree = await updatePositionTree(accessToken, {
        positions: flattenTreeForUpdate(nextPositions)
      });
      setPositions(updatedTree);
      onMessage("로그인 화면 조직도가 저장되었습니다.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "로그인 화면 조직도를 저장하지 못했습니다.");
      await refreshPositions();
    } finally {
      setIsSaving(false);
    }
  }

  function handlePointerDragStart(position: PositionTreeNode, x: number, y: number) {
    if (position.isAdmin) {
      onMessage("관리자는 직위를 설정할 수 없습니다.");
      return;
    }

    setPointerDraggingId(position.id);
    setDraggingId(position.id);
    setDragPreview({
      name: position.name,
      subtitle: position.subtitle,
      x,
      y
    });
  }

  function handlePointerEnter(positionId: number) {
    if (pointerDraggingId === null || pointerDraggingId === positionId) {
      return;
    }

    setDropTargetId(positionId);
  }

  return (
    <section className="relative rounded-[18px] border border-[#D9D1F3] bg-[#F8F5FF] px-3 py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-black text-[#5A3E3B]">로그인 화면 직위트리 관리</h2>
          <p className="mt-0.5 text-[11px] font-bold leading-3 text-[#9B7A75]">
            직위를 추가하고 드래그해서 로그인 화면의 직급 구조를 연결합니다.
          </p>
        </div>
        <button
          className="h-7 shrink-0 rounded-full border-2 border-[#8B72C8] bg-white px-3 text-[12px] font-black text-[#8B72C8]"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
      </div>

      <div className="mt-3 rounded-[16px] border border-[#D9D1F3] bg-white p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[14px] font-black text-[#3F2C28]">직위 트리 구성</p>
          <div className="flex items-center gap-1.5">
            {isSaving && <span className="text-[11px] font-black text-[#8B72C8]">저장 중</span>}
            <button
              className="flex h-7 items-center gap-1 rounded-full bg-[#8B72C8] px-2.5 text-[11px] font-black text-white shadow-sm"
              onClick={handleOpenCreateModal}
              type="button"
            >
              <Plus aria-hidden className="h-3 w-3" />
              직위 추가
            </button>
          </div>
        </div>
        {draggingPosition && (
          <div className="mt-2 rounded-[12px] border border-[#D9D1F3] bg-[#F7F3FF] px-2.5 py-2 text-center text-[11px] font-black text-[#5A3E3B]">
            {dropTargetPosition ? (
              <>
                <span className="text-[#8B72C8]">{draggingPosition.name}</span>
                <span className="mx-2 text-[#B7A8D8]">-&gt;</span>
                <span className="text-primary">{dropTargetPosition.name}</span>
                <span className="ml-1 text-[#8D706B]">하위로 이동합니다.</span>
              </>
            ) : (
              <>
                <span className="text-[#8B72C8]">{draggingPosition.name}</span>
                <span className="ml-1 text-[#8D706B]">을 이동할 위치 위에 올려주세요.</span>
              </>
            )}
          </div>
        )}
        <div className="mt-2.5 max-h-[260px] overflow-auto rounded-[14px] bg-[#FFFEFC] px-3 py-5">
          {isLoading ? (
            <p className="rounded-[12px] bg-[#F8F5FF] px-3 py-3 text-[12px] font-bold text-[#8B72C8]">
              로그인 화면 조직도를 불러오는 중입니다.
            </p>
          ) : flatPositions.length === 0 ? (
            <p className="rounded-[12px] bg-[#F8F5FF] px-3 py-3 text-[12px] font-bold text-[#8B72C8]">
              등록된 직위가 없습니다.
            </p>
          ) : (
            <div className="flex min-w-max justify-center gap-4">
              {positions.map((position, index) => (
                <PositionTreeEditorNode
                  depth={0}
                  draggingId={draggingId}
                  dropTargetId={dropTargetId}
                  index={index}
                  key={position.id}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDropTargetId(null);
                  }}
                  onBlockedDrag={() => {
                    onMessage("관리자는 직위를 설정할 수 없습니다.");
                  }}
                  onDragStart={(event, position) => {
                    if (position.isAdmin) {
                      event.preventDefault();
                      onMessage("관리자는 직위를 설정할 수 없습니다.");
                      return;
                    }
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(position.id));
                    setDraggingId(position.id);
                  }}
                  onDrop={(event, positionId) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const movingId = Number(event.dataTransfer.getData("text/plain"));
                    void handleDrop(positionId, Number.isNaN(movingId) ? draggingId : movingId);
                  }}
                  onDropTargetChange={setDropTargetId}
                  onDeleteRequest={setDeleteTarget}
                  position={position}
                  onPointerDragStart={handlePointerDragStart}
                  onPointerEnter={handlePointerEnter}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 rounded-[16px] border border-[#D9D1F3] bg-white p-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-black text-[#3F2C28]">상위 직위 설정</p>
          <span className="text-[10px] font-bold text-[#9B7A75]">드래그 없이 관계 변경</span>
        </div>
        <div className="mt-2 max-h-[130px] space-y-1.5 overflow-y-auto pr-1">
          {flatPositions.length === 0 ? (
            <p className="rounded-[12px] bg-[#F8F5FF] px-3 py-3 text-[12px] font-bold text-[#8B72C8]">
              등록된 직위가 없습니다.
            </p>
          ) : (
            flatPositions.map((position) => (
              <div
                className="grid items-center gap-1.5 rounded-[12px] border border-[#EEE2E5] bg-[#FFFEFC] px-2 py-1.5"
                key={position.id}
              >
                <div>
                  <p className="text-[12px] font-black text-[#3F2C28]">{position.name}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#9B7A75]">
                    {position.subtitle || "설명 없음"}
                  </p>
                </div>
                <select
                  className="h-8 rounded-[10px] border border-[#D9D1F3] bg-white px-2 text-[11px] font-bold text-[#8D706B] outline-none"
                  disabled={isSaving}
                  onChange={(event) =>
                    void handleParentChange(position.id, event.target.value ? Number(event.target.value) : null)
                  }
                  value={position.parentId ?? ""}
                >
                  <option value="">상위 직위 없음</option>
                  {flatPositions
                    .filter(
                      (option) => option.id !== position.id && !option.ancestorIds.includes(position.id)
                    )
                    .map((option) => (
                      <option key={option.id} value={option.id}>
                        {"　".repeat(option.depth)}
                        {option.name}
                      </option>
                    ))}
                </select>
              </div>
            ))
          )}
        </div>
      </div>
      {isCreateModalOpen && (
        <PositionCreateModal
          duty={duty}
          flatPositions={flatPositions}
          isAdmin={isAdmin}
          isLoginVisible={isLoginVisible}
          isSaving={isSaving}
          name={name}
          parentId={parentId}
          subtitle={subtitle}
          onClose={handleCloseCreateModal}
          onDutyChange={setDuty}
          onIsAdminChange={setIsAdmin}
          onIsLoginVisibleChange={setIsLoginVisible}
          onNameChange={setName}
          onParentIdChange={setParentId}
          onSubmit={handleCreatePosition}
          onSubtitleChange={setSubtitle}
        />
      )}
      {deleteTarget && (
        <PositionDeleteConfirmModal
          errorMessage={deleteErrorMessage}
          isSaving={isSaving}
          positionName={deleteTarget.name}
          onCancel={() => {
            setDeleteErrorMessage("");
            setDeleteTarget(null);
          }}
          onConfirm={() => void handleDeletePosition()}
        />
      )}
      {dragPreview && (
        <div
          className="pointer-events-none fixed z-[90] flex min-h-[74px] w-[118px] -translate-x-1/2 -translate-y-1/2 rotate-[-2deg] select-none flex-col items-center justify-center rounded-[14px] border-2 border-[#8B72C8] bg-[#F7F3FF] px-3 py-2 text-center opacity-90 shadow-[0_16px_34px_rgba(90,62,59,0.24)]"
          style={{
            left: dragPreview.x,
            top: dragPreview.y
          }}
        >
          <p className="text-[14px] font-black leading-tight text-[#3F2C28]">{dragPreview.name}</p>
          <p className="mt-1 line-clamp-1 text-[11px] font-bold leading-tight text-[#9B7A75]">
            {dragPreview.subtitle || "설명 없음"}
          </p>
        </div>
      )}
    </section>
  );
}

type FlatPosition = PositionTreeNode & {
  ancestorIds: number[];
  depth: number;
};

function PositionCreateModal({
  duty,
  flatPositions,
  isAdmin,
  isLoginVisible,
  isSaving,
  name,
  parentId,
  subtitle,
  onClose,
  onDutyChange,
  onIsAdminChange,
  onIsLoginVisibleChange,
  onNameChange,
  onParentIdChange,
  onSubmit,
  onSubtitleChange
}: {
  duty: string;
  flatPositions: FlatPosition[];
  isAdmin: boolean;
  isLoginVisible: boolean;
  isSaving: boolean;
  name: string;
  parentId: number | "";
  subtitle: string;
  onClose: () => void;
  onDutyChange: (value: string) => void;
  onIsAdminChange: (value: boolean) => void;
  onIsLoginVisibleChange: (value: boolean) => void;
  onNameChange: (value: string) => void;
  onParentIdChange: (value: number | "") => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSubtitleChange: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#3F2C28]/35 px-4">
      <form
        className="w-full max-w-[520px] rounded-[26px] border border-[#D9D1F3] bg-[#FFFEFC] p-6 shadow-[0_18px_44px_rgba(90,62,59,0.2)]"
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[#3F2C28]">직위 추가</h3>
            <p className="mt-1 text-xs font-bold leading-5 text-[#9B7A75]">
              식별 코드는 직위명 기반으로 자동 생성됩니다.
            </p>
          </div>
          <button
            className="h-9 rounded-full border border-[#D9D1F3] bg-white px-4 text-xs font-black text-[#8B72C8]"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <input
            className="h-11 rounded-[12px] border-2 border-[#D9D1F3] bg-white px-4 text-sm font-bold text-[#4B332E] outline-none placeholder:text-[#B7A8D8]"
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="직위명 예: 개발팀장"
            required
            value={name}
          />
          <input
            className="h-11 rounded-[12px] border-2 border-[#D9D1F3] bg-white px-4 text-sm font-bold text-[#4B332E] outline-none placeholder:text-[#B7A8D8]"
            onChange={(event) => onSubtitleChange(event.target.value)}
            placeholder="역할 설명 예: 개발관리"
            value={subtitle}
          />
          <div className="grid gap-3 ">
            <input
              className="h-11 rounded-[12px] border-2 border-[#D9D1F3] bg-white px-4 text-sm font-bold text-[#8D706B] outline-none"
              onChange={(event) => onDutyChange(event.target.value)}
              placeholder="담당 역할 예: 개발"
              value={duty}
            />
            <select
              className="h-11 rounded-[12px] border-2 border-[#D9D1F3] bg-white px-4 text-sm font-bold text-[#8D706B] outline-none"
              onChange={(event) => onParentIdChange(event.target.value ? Number(event.target.value) : "")}
              value={parentId}
            >
              <option value="">상위 직위 없음</option>
              {flatPositions.map((position) => (
                <option key={position.id} value={position.id}>
                  {"　".repeat(position.depth)}
                  {position.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 ">
            <label className="flex h-11 items-center gap-2 rounded-[12px] border-2 border-[#D9D1F3] bg-white px-4 text-sm font-bold text-[#8D706B]">
              <input
                checked={isLoginVisible}
                className="accent-[#8B72C8]"
                onChange={(event) => onIsLoginVisibleChange(event.target.checked)}
                type="checkbox"
              />
              로그인 표시
            </label>
            <label className="flex h-11 items-center gap-2 rounded-[12px] border-2 border-[#D9D1F3] bg-white px-4 text-sm font-bold text-[#8D706B]">
              <input
                checked={isAdmin}
                className="accent-[#8B72C8]"
                onChange={(event) => onIsAdminChange(event.target.checked)}
                type="checkbox"
              />
              관리자 직위
            </label>
          </div>
        </div>

        <button
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#8B72C8] px-6 text-sm font-black text-white disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          <Plus aria-hidden className="h-4 w-4" />
          {isSaving ? "저장 중" : "직위 추가"}
        </button>
      </form>
    </div>
  );
}

function PositionDeleteConfirmModal({
  errorMessage,
  isSaving,
  positionName,
  onCancel,
  onConfirm
}: {
  errorMessage: string;
  isSaving: boolean;
  positionName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#3F2C28]/35 px-4">
      <div className="w-full max-w-[360px] rounded-[24px] border border-[#F2C9C2] bg-[#FFFEFC] p-6 text-center shadow-[0_18px_44px_rgba(90,62,59,0.2)]">
        <h3 className="text-lg font-black text-[#3F2C28]">직위를 삭제할까요?</h3>
        <p className="mt-3 text-sm font-bold leading-6 text-[#8D706B]">
          {positionName} 직위를 삭제하면 하위 직위도 함께 조직도에서 숨김 처리됩니다.
        </p>
        {errorMessage && (
          <p className="mt-4 rounded-[14px] border border-[#F2C9C2] bg-[#FFF3F5] px-4 py-3 text-sm font-black leading-5 text-[#C46E7B]">
            {errorMessage}
          </p>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className="h-11 rounded-full border border-[#D9D1F3] bg-white text-sm font-black text-[#8B72C8]"
            disabled={isSaving}
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="h-11 rounded-full bg-[#E58C9B] text-sm font-black text-white disabled:opacity-60"
            disabled={isSaving}
            onClick={onConfirm}
            type="button"
          >
            {isSaving ? "삭제 중" : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PositionTreeEditorNode({
  depth,
  draggingId,
  dropTargetId,
  index,
  onDragEnd,
  onDragStart,
  onDrop,
  onDropTargetChange,
  onDeleteRequest,
  onBlockedDrag,
  onPointerDragStart,
  onPointerEnter,
  position
}: {
  depth: number;
  draggingId: number | null;
  dropTargetId: number | null;
  index: number;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLElement>, position: PositionTreeNode) => void;
  onDrop: (event: DragEvent<HTMLElement>, positionId: number) => void;
  onDropTargetChange: (positionId: number) => void;
  onDeleteRequest: (position: PositionTreeNode) => void;
  onBlockedDrag: () => void;
  onPointerDragStart: (position: PositionTreeNode, x: number, y: number) => void;
  onPointerEnter: (positionId: number) => void;
  position: PositionTreeNode;
}) {
  const children = position.children ?? [];

  return (
    <div className="relative flex flex-col items-center">
      <PositionTreeCard
        depth={depth}
        draggingId={draggingId}
        dropTargetId={dropTargetId}
        index={index}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        onDrop={onDrop}
        onDropTargetChange={onDropTargetChange}
        onDeleteRequest={onDeleteRequest}
        onBlockedDrag={onBlockedDrag}
        onPointerDragStart={onPointerDragStart}
        onPointerEnter={onPointerEnter}
        position={position}
      />

      {children.length > 0 && (
        <div className="relative mt-4 flex min-w-max flex-col items-center">
          <span className="absolute left-1/2 top-[-1rem] h-[1.05rem] w-0.5 -translate-x-1/2 rounded-full bg-[#D9D1F3]" />
          <span
            className={cn(
              "absolute top-[-1px] h-0.5 rounded-full bg-[#D9D1F3]",
              children.length === 1 && "left-1/2 right-1/2",
              children.length === 2 && "left-1/4 right-1/4",
              children.length === 3 && "left-[16.666%] right-[16.666%]",
              children.length >= 4 && "left-[12.5%] right-[12.5%]"
            )}
          />
          <div
            className={cn(
              "grid justify-items-center gap-2 pt-3",
              children.length === 1 && "grid-cols-1",
              children.length === 2 && "grid-cols-2",
              children.length === 3 && "grid-cols-3",
              children.length >= 4 && "grid-cols-4"
            )}
          >
            {children.map((child, childIndex) => (
              <div className="relative" key={child.id}>
                <span className="absolute left-1/2 top-[-0.8rem] h-[0.85rem] w-0.5 -translate-x-1/2 rounded-full bg-[#D9D1F3]" />
                <PositionTreeEditorNode
                  depth={depth + 1}
                  draggingId={draggingId}
                  dropTargetId={dropTargetId}
                  index={childIndex + index + 1}
                  onDragEnd={onDragEnd}
                  onDragStart={onDragStart}
                  onDrop={onDrop}
                  onDropTargetChange={onDropTargetChange}
                  onDeleteRequest={onDeleteRequest}
                  onBlockedDrag={onBlockedDrag}
                  onPointerDragStart={onPointerDragStart}
                  onPointerEnter={onPointerEnter}
                  position={child}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PositionTreeCard({
  depth,
  draggingId,
  dropTargetId,
  index,
  onDragEnd,
  onDragStart,
  onDrop,
  onDropTargetChange,
  onDeleteRequest,
  onBlockedDrag,
  onPointerDragStart,
  onPointerEnter,
  position
}: {
  depth: number;
  draggingId: number | null;
  dropTargetId: number | null;
  index: number;
  onDragEnd: () => void;
  onDragStart: (event: DragEvent<HTMLElement>, position: PositionTreeNode) => void;
  onDrop: (event: DragEvent<HTMLElement>, positionId: number) => void;
  onDropTargetChange: (positionId: number) => void;
  onDeleteRequest: (position: PositionTreeNode) => void;
  onBlockedDrag: () => void;
  onPointerDragStart: (position: PositionTreeNode, x: number, y: number) => void;
  onPointerEnter: (positionId: number) => void;
  position: PositionTreeNode;
}) {
  const isDragging = draggingId === position.id;
  const isDropTarget = dropTargetId === position.id;
  const toneClassNames = [
    "border-[#F2C9C2] bg-[#FFF6F8]",
    "border-[#D9D1F3] bg-[#F7F3FF]",
    "border-[#D6DEBF] bg-[#FAF9EA]",
    "border-[#F0D8A8] bg-[#FFF8E9]"
  ];

  return (
    <article
      data-position-id={position.id}
      className={cn(
        "relative flex min-h-[56px] w-[82px] touch-none cursor-grab select-none flex-col items-center justify-center rounded-[11px] border px-1.5 py-1.5 text-center shadow-sm transition active:cursor-grabbing",
        toneClassNames[(index + depth) % toneClassNames.length],
        isDropTarget && "scale-[1.06] border-2 border-[#8B72C8] bg-[#F7F3FF] shadow-[0_0_0_5px_rgba(139,114,200,0.18)]",
        isDragging && "opacity-25"
      )}
      draggable={false}
      onMouseDown={() => {
        if (position.isAdmin) {
          onBlockedDrag();
        }
      }}
      onPointerDown={(event: ReactPointerEvent<HTMLElement>) => {
        if (event.button !== 0) {
          return;
        }

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onPointerDragStart(position, event.clientX, event.clientY);
      }}
      onPointerEnter={() => onPointerEnter(position.id)}
      onPointerUp={(event: ReactPointerEvent<HTMLElement>) => {
        event.stopPropagation();
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onDragEnd={onDragEnd}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!isDragging) {
          onDropTargetChange(position.id);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (!isDragging) {
          onDropTargetChange(position.id);
        }
      }}
      onDragStart={(event) => onDragStart(event, position)}
      onDrop={(event) => onDrop(event, position.id)}
    >
      <button
        aria-label={`${position.name} 삭제`}
        className="absolute left-0.5 top-0.5 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/90 text-[#C46E7B] shadow-sm transition hover:bg-[#FFECEF]"
        draggable={false}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onDeleteRequest(position);
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onDragStart={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        type="button"
      >
        <X aria-hidden className="h-2 w-2 stroke-[3]" />
      </button>
      {isDropTarget && !isDragging && (
        <span className="pointer-events-none absolute -top-6 left-1/2 z-10 w-max -translate-x-1/2 rounded-full bg-[#8B72C8] px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
          여기 하위로 이동
        </span>
      )}
      {isDropTarget && !isDragging && (
        <span className="pointer-events-none absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-[#8B72C8]" />
      )}
      <p className="pointer-events-none text-[11px] font-black leading-tight text-[#3F2C28]">
        {position.name}
      </p>
      <p className="pointer-events-none mt-0.5 line-clamp-1 text-[9px] font-bold leading-tight text-[#9B7A75]">
        {position.subtitle || "설명 없음"}
      </p>
      {!position.isLoginVisible && (
        <span className="pointer-events-none mt-0.5 rounded-full bg-white/80 px-1 py-0.5 text-[8px] font-black text-[#9B7A75]">
          로그인 숨김
        </span>
      )}
    </article>
  );
}

function flattenPositions(
  positions: PositionTreeNode[],
  depth = 0,
  ancestorIds: number[] = []
): FlatPosition[] {
  return positions.flatMap((position) => [
    {
      ...position,
      ancestorIds,
      depth
    },
    ...flattenPositions(position.children ?? [], depth + 1, [...ancestorIds, position.id])
  ]);
}

function flattenTreeForUpdate(positions: PositionTreeNode[]) {
  return flattenPositions(positions).map((position, index) => ({
    id: position.id,
    parentId: position.parentId,
    displayOrder: index
  }));
}

function movePositionToParent(
  positions: PositionTreeNode[],
  movingId: number,
  parentId: number | null
): PositionTreeNode[] {
  const { nodes, movingNode } = removePosition(positions, movingId);

  if (!movingNode) {
    return positions;
  }

  const nextNode = {
    ...movingNode,
    parentId
  };

  if (parentId === null) {
    return [...nodes, nextNode];
  }

  return insertPositionAsChild(nodes, parentId, nextNode);
}

function removePosition(
  positions: PositionTreeNode[],
  movingId: number
): {
  movingNode: PositionTreeNode | null;
  nodes: PositionTreeNode[];
} {
  let movingNode: PositionTreeNode | null = null;
  const nodes = positions.flatMap((position) => {
    if (position.id === movingId) {
      movingNode = position;
      return [];
    }

    const result = removePosition(position.children ?? [], movingId);
    if (result.movingNode) {
      movingNode = result.movingNode;
    }

    return {
      ...position,
      children: result.nodes
    };
  });

  return { movingNode, nodes };
}

function insertPositionAsChild(
  positions: PositionTreeNode[],
  parentId: number,
  child: PositionTreeNode
): PositionTreeNode[] {
  return positions.map((position) => {
    if (position.id === parentId) {
      return {
        ...position,
        children: [...(position.children ?? []), child]
      };
    }

    return {
      ...position,
      children: insertPositionAsChild(position.children ?? [], parentId, child)
    };
  });
}
