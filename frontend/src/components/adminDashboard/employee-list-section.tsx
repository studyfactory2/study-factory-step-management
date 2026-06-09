import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { flushSync } from "react-dom";
import type { AdminDashboardEmployee } from "@/api/admin";
import { statusLabels } from "./constants";

type VisibleTaskStatus = "REGISTERED" | "IN_PROGRESS" | "REVIEW_REQUESTED";
type DropIndicator = {
  memberId: number;
  side: "left" | "right";
} | null;

type EmployeeListSectionProps = {
  candidates: AdminDashboardEmployee[];
  employees: AdminDashboardEmployee[];
  isUpdating: boolean;
  maxFavoriteCount?: number;
  onAddFavoriteMember: (memberId: number) => void;
  onDeleteFavoriteMember: (memberId: number, memberName: string) => void;
  onReorderFavoriteMembers: (memberIds: number[]) => Promise<void>;
};

export function EmployeeListSection({
  candidates,
  employees,
  isUpdating,
  maxFavoriteCount = 10,
  onAddFavoriteMember,
  onDeleteFavoriteMember,
  onReorderFavoriteMembers
}: EmployeeListSectionProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draggingMemberId, setDraggingMemberId] = useState<number | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator>(null);
  const [orderedEmployees, setOrderedEmployees] = useState(employees);
  const hoverTargetIndexRef = useRef<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingOrderKeyRef = useRef<string | null>(null);
  const cardElementMapRef = useRef(new Map<number, HTMLElement>());
  const favoriteMemberIds = orderedEmployees.map((employee) => employee.id);
  const addableCandidates = candidates.filter((candidate) => !favoriteMemberIds.includes(candidate.id));
  const visibleEmployees = orderedEmployees;
  const favoriteSlots: Array<AdminDashboardEmployee | null> = Array.from({ length: maxFavoriteCount }, (_, index) =>
    visibleEmployees[index] ?? null
  );

  useEffect(() => {
    if (draggingMemberId) {
      return;
    }

    const employeeOrderKey = createOrderKey(employees);

    if (pendingOrderKeyRef.current && pendingOrderKeyRef.current !== employeeOrderKey) {
      return;
    }

    pendingOrderKeyRef.current = null;
    setOrderedEmployees(employees);
  }, [draggingMemberId, employees]);

  useEffect(() => {
    return clearHoverTimer;
  }, []);

  function clearHoverTimer() {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = null;
    hoverTargetIndexRef.current = null;
  }

  function reorderEmployees(
    currentEmployees: AdminDashboardEmployee[],
    draggingId: number,
    insertionIndex: number
  ) {
    const sourceIndex = currentEmployees.findIndex((employee) => employee.id === draggingId);

    if (sourceIndex < 0) {
      return currentEmployees;
    }

    const nextEmployees = [...currentEmployees];
    const [draggedEmployee] = nextEmployees.splice(sourceIndex, 1);
    const targetIndex = insertionIndex > sourceIndex ? insertionIndex - 1 : insertionIndex;
    nextEmployees.splice(Math.max(0, Math.min(targetIndex, nextEmployees.length)), 0, draggedEmployee);

    return nextEmployees;
  }

  function setCardElement(memberId: number, element: HTMLElement | null) {
    if (element) {
      cardElementMapRef.current.set(memberId, element);
      return;
    }

    cardElementMapRef.current.delete(memberId);
  }

  function getCardRects() {
    const cardRects = new Map<number, DOMRect>();

    cardElementMapRef.current.forEach((element, memberId) => {
      cardRects.set(memberId, element.getBoundingClientRect());
    });

    return cardRects;
  }

  function animateReorder(nextEmployees: AdminDashboardEmployee[]) {
    const previousRects = getCardRects();

    flushSync(() => {
      setOrderedEmployees(nextEmployees);
    });

    requestAnimationFrame(() => {
      cardElementMapRef.current.forEach((element, memberId) => {
        const previousRect = previousRects.get(memberId);

        if (!previousRect) {
          return;
        }

        const nextRect = element.getBoundingClientRect();
        const translateX = previousRect.left - nextRect.left;
        const translateY = previousRect.top - nextRect.top;

        if (translateX === 0 && translateY === 0) {
          return;
        }

        element.animate(
          [
            { transform: `translate(${translateX}px, ${translateY}px)` },
            { transform: "translate(0, 0)" }
          ],
          {
            duration: 360,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)"
          }
        );
      });
    });
  }

  function handleDragOver(targetIndex: number, event: DragEvent<HTMLElement>, targetMemberId: number) {
    if (!draggingMemberId || isUpdating) {
      return;
    }

    const sourceIndex = orderedEmployees.findIndex((employee) => employee.id === draggingMemberId);
    const targetRect = event.currentTarget.getBoundingClientRect();
    const side = event.clientX < targetRect.left + targetRect.width / 2 ? "left" : "right";
    const insertionIndex = side === "left" ? targetIndex : targetIndex + 1;
    const hoverKey = `${targetMemberId}-${side}-${insertionIndex}`;

    if (sourceIndex < 0 || hoverTargetIndexRef.current === hoverKey) {
      return;
    }

    clearHoverTimer();
    setDropIndicator(
      draggingMemberId === targetMemberId
        ? null
        : {
            memberId: targetMemberId,
            side
          }
    );
    hoverTargetIndexRef.current = hoverKey;
    hoverTimerRef.current = setTimeout(() => {
      const nextEmployees = reorderEmployees(orderedEmployees, draggingMemberId, insertionIndex);
      animateReorder(nextEmployees);
      setDropIndicator(null);
      clearHoverTimer();
    }, 500);
  }

  function handleDragEnd() {
    clearHoverTimer();
    setDropIndicator(null);
    setDraggingMemberId(null);

    if (!pendingOrderKeyRef.current) {
      setOrderedEmployees(employees);
    }
  }

  async function handleDrop(targetIndex: number, event: DragEvent<HTMLElement>) {
    if (!draggingMemberId || isUpdating) {
      return;
    }

    clearHoverTimer();
    const targetRect = event.currentTarget.getBoundingClientRect();
    const side = event.clientX < targetRect.left + targetRect.width / 2 ? "left" : "right";
    const insertionIndex = side === "left" ? targetIndex : targetIndex + 1;
    const reorderedEmployees = reorderEmployees(orderedEmployees, draggingMemberId, insertionIndex);
    pendingOrderKeyRef.current = createOrderKey(reorderedEmployees);
    animateReorder(reorderedEmployees);
    setDropIndicator(null);
    setDraggingMemberId(null);

    await onReorderFavoriteMembers(reorderedEmployees.map((employee) => employee.id));
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-[#3F2C28]">함께 프로젝트 중</h2>
      </div>
      <div className="rounded-[28px] border border-[#F1CFD5] bg-[#FFFEFC]/95 p-7 shadow-[0_10px_22px_rgba(239,126,158,0.12)]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {favoriteSlots.map((employee, index) => (
            employee ? (
              <EmployeeCard
                draggable={!isUpdating}
                dropIndicatorSide={dropIndicator?.memberId === employee.id ? dropIndicator.side : null}
                employee={employee}
                isDragging={draggingMemberId === employee.id}
                key={employee.id}
                onCardRef={(element) => setCardElement(employee.id, element)}
                onDragEnd={handleDragEnd}
                onDragOver={(event) => {
                  event.preventDefault();
                  handleDragOver(index, event, employee.id);
                }}
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(employee.id));
                  setSoftDragImage(event);
                  setDraggingMemberId(employee.id);
                }}
                onDrop={(event) => void handleDrop(index, event)}
                onRemove={() => onDeleteFavoriteMember(employee.id, employee.name)}
              />
            ) : (
              <EmptySlot
                disabled={isUpdating || employees.length >= maxFavoriteCount}
                key={`empty-${index}`}
                onSelect={() => setIsAddModalOpen(true)}
                slotNumber={index + 1}
              />
            )
          ))}
        </div>

        {isAddModalOpen && (
          <FavoriteMemberAddModal
            candidates={addableCandidates}
            isUpdating={isUpdating}
            onAddFavoriteMember={(memberId) => {
              onAddFavoriteMember(memberId);
              setIsAddModalOpen(false);
            }}
            onClose={() => setIsAddModalOpen(false)}
          />
        )}
      </div>
    </section>
  );
}

function createOrderKey(employees: AdminDashboardEmployee[]): string {
  return employees.map((employee) => employee.id).join(",");
}

function setSoftDragImage(event: DragEvent<HTMLElement>) {
  const dragElement = event.currentTarget;
  const dragImage = dragElement.cloneNode(true) as HTMLElement;
  const rect = dragElement.getBoundingClientRect();

  dragImage.style.width = `${rect.width}px`;
  dragImage.style.height = `${rect.height}px`;
  dragImage.style.opacity = "0.06";
  dragImage.style.filter = "saturate(0.35) brightness(1.18)";
  dragImage.style.pointerEvents = "none";
  dragImage.style.position = "fixed";
  dragImage.style.top = "-1000px";
  dragImage.style.left = "-1000px";
  dragImage.style.transform = "scale(0.96)";
  dragImage.style.boxShadow = "none";
  document.body.appendChild(dragImage);

  event.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
  window.setTimeout(() => dragImage.remove(), 0);
}

function EmployeeCard({
  draggable,
  dropIndicatorSide,
  employee,
  isDragging,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onCardRef,
  onRemove
}: {
  draggable: boolean;
  dropIndicatorSide: "left" | "right" | null;
  employee: AdminDashboardEmployee;
  isDragging: boolean;
  onCardRef: (element: HTMLElement | null) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onRemove: () => void;
}) {
  const [visibleStatus, setVisibleStatus] = useState<VisibleTaskStatus>(
    employee.highestTaskStatus ?? "REGISTERED"
  );
  const visibleStatusCount = getVisibleStatusCount(employee, visibleStatus);

  function handleStatusClick() {
    setVisibleStatus((currentStatus) => {
      if (currentStatus === "REGISTERED") {
        return "IN_PROGRESS";
      }

      if (currentStatus === "IN_PROGRESS") {
        return "REVIEW_REQUESTED";
      }

      return "REGISTERED";
    });
  }

  return (
    <article
      className={`relative min-h-[252px] cursor-grab rounded-[24px] border border-[#F1CFD5] bg-white px-5 py-5 text-center shadow-[0_8px_0_#F3D1D8] transition active:cursor-grabbing ${
        isDragging ? "opacity-0" : ""
      }`}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDrop={onDrop}
      ref={onCardRef}
    >
      {dropIndicatorSide && !isDragging && (
        <span
          className={`pointer-events-none absolute bottom-4 top-4 z-10 w-2 rounded-full bg-primary/30 shadow-[0_0_18px_rgba(241,136,164,0.65)] ${
            dropIndicatorSide === "left" ? "-left-3" : "-right-3"
          }`}
        />
      )}
      <button
        aria-label={`${employee.name} 삭제`}
        className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#F1CFD5] bg-[#FFF8F9] text-xs font-black text-primary"
        onClick={onRemove}
        type="button"
      >
        ×
      </button>
      <span className="block text-sm font-black text-[#8F7470]">
        {employee.positionName ?? "직원"}
      </span>
      <p className="mt-5 text-xl font-black text-[#3F2C28]">{employee.name}</p>
      <p className="mt-2 text-sm font-black text-primary">
        {employee.highestTaskStatus ? statusLabels[employee.highestTaskStatus] : "업무등록"}
      </p>
      <div className="my-4 border-t border-[#F1CFD5]" />
      <button
        className={`mx-auto h-10 w-32 rounded-full border border-[#F1CFD5] text-sm font-black ${getStatusClassName(visibleStatus)}`}
        onClick={handleStatusClick}
        type="button"
      >
        {getShortStatusLabel(visibleStatus)}
      </button>
      <p className={`mt-2 text-sm font-black ${getStatusTextClassName(visibleStatus)}`}>
        {visibleStatusCount}건
      </p>
      <button className="mt-5 h-9 w-full rounded-full border border-[#F0B9C8] bg-white text-sm font-black text-primary">
        상세정보
      </button>
    </article>
  );
}

function EmptySlot({
  disabled,
  onSelect,
  slotNumber
}: {
  disabled: boolean;
  onSelect: () => void;
  slotNumber: number;
}) {
  return (
    <button
      className="flex min-h-[252px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#F1CFD5] bg-[#FFF8F9] px-5 py-5 text-center transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={onSelect}
      type="button"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-black text-[#F188A4] shadow-sm">
        +
      </span>
      <p className="mt-4 text-sm font-black text-[#9C7D79]">{slotNumber}번 슬롯</p>
      <p className="mt-1 text-xs font-bold text-[#B79A94]">직원 미선택</p>
    </button>
  );
}

function FavoriteMemberAddModal({
  candidates,
  isUpdating,
  onAddFavoriteMember,
  onClose
}: {
  candidates: AdminDashboardEmployee[];
  isUpdating: boolean;
  onAddFavoriteMember: (memberId: number) => void;
  onClose: () => void;
}) {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const branches = useMemo(() => {
    const values = candidates.map((candidate) => candidate.branch ?? "미지정");
    return Array.from(new Set(values));
  }, [candidates]);
  const positions = useMemo(() => {
    const values = candidates
      .filter((candidate) => !selectedBranch || (candidate.branch ?? "미지정") === selectedBranch)
      .map((candidate) => candidate.positionName ?? "직원");
    return Array.from(new Set(values));
  }, [candidates, selectedBranch]);
  const assignees = useMemo(() => {
    return candidates.filter((candidate) => {
      const isSameBranch = !selectedBranch || (candidate.branch ?? "미지정") === selectedBranch;
      const isSamePosition = !selectedPosition || (candidate.positionName ?? "직원") === selectedPosition;
      return isSameBranch && isSamePosition;
    });
  }, [candidates, selectedBranch, selectedPosition]);

  function handleBranchChange(value: string) {
    setSelectedBranch(value);
    setSelectedPosition("");
    setSelectedMemberId("");
  }

  function handlePositionChange(value: string) {
    setSelectedPosition(value);
    setSelectedMemberId("");
  }

  function handleSubmit() {
    if (!selectedMemberId) {
      return;
    }

    onAddFavoriteMember(Number(selectedMemberId));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F2C28]/25 px-4">
      <div className="w-full max-w-[520px] rounded-[28px] border border-[#F1CFD5] bg-[#FFFEFC] p-7 shadow-[0_18px_40px_rgba(63,44,40,0.18)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-2xl font-black text-[#3F2C28]">직원 선택</h3>
          <button
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#F1CFD5] bg-[#FFF8F9] text-sm font-black text-primary"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="mt-6 grid gap-4">
          <select
            className="h-12 rounded-[14px] border border-[#F1CFD5] bg-[#FFF8F6] px-4 text-sm font-bold text-[#9B7A75] outline-none"
            onChange={(event) => handleBranchChange(event.target.value)}
            value={selectedBranch}
          >
            <option value="">지점</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
          <select
            className="h-12 rounded-[14px] border border-[#F1CFD5] bg-[#FFF8F6] px-4 text-sm font-bold text-[#9B7A75] outline-none"
            onChange={(event) => handlePositionChange(event.target.value)}
            value={selectedPosition}
          >
            <option value="">직위</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          <select
            className="h-12 rounded-[14px] border border-[#F1CFD5] bg-[#FFF8F6] px-4 text-sm font-bold text-[#9B7A75] outline-none"
            onChange={(event) => setSelectedMemberId(event.target.value)}
            value={selectedMemberId}
          >
            <option value="">담당자</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </div>
        {candidates.length === 0 && (
          <p className="mt-5 rounded-[16px] border border-dashed border-[#F1CFD5] bg-[#FFF8F9] px-4 py-5 text-sm font-bold text-[#9C7D79]">
            추가할 직원이 없습니다.
          </p>
        )}
        <div className="mt-7 flex justify-end gap-3">
          <button
            className="h-11 rounded-full border border-[#F1CFD5] bg-white px-6 text-sm font-black text-[#9C7D79]"
            onClick={onClose}
            type="button"
          >
            취소
          </button>
          <button
            className="h-11 rounded-full bg-primary px-8 text-sm font-black text-white disabled:opacity-60"
            disabled={!selectedMemberId || isUpdating}
            onClick={handleSubmit}
            type="button"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

function getShortStatusLabel(status: VisibleTaskStatus) {
  if (status === "REGISTERED") {
    return "등록 업무";
  }

  if (status === "IN_PROGRESS") {
    return "진행";
  }

  return "검토 요청";
}

function getStatusClassName(status: VisibleTaskStatus) {
  if (status === "REGISTERED") {
    return "bg-[#FBE6EA] text-primary";
  }

  if (status === "IN_PROGRESS") {
    return "bg-[#EEE8FF] text-[#8B72C8]";
  }

  return "bg-[#FFF1D7] text-[#C88449]";
}

function getStatusTextClassName(status: VisibleTaskStatus) {
  if (status === "REGISTERED") {
    return "text-primary";
  }

  if (status === "IN_PROGRESS") {
    return "text-[#8B72C8]";
  }

  return "text-[#C88449]";
}

function getVisibleStatusCount(employee: AdminDashboardEmployee, status: VisibleTaskStatus) {
  if (status === "REGISTERED") {
    return employee.taskCounts.registered;
  }

  if (status === "IN_PROGRESS") {
    return employee.taskCounts.inProgress;
  }

  return employee.taskCounts.reviewRequested;
}
