import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ImagePlus, Pencil, Search } from "lucide-react";
import { getPositionTree, type PositionTreeNode } from "@/api/position";
import {
  createTaskDraft,
  getTaskDrafts,
  publishTaskDraft,
  type TaskCategory,
  updateTaskDraft
} from "@/api/task";
import { ImagePreviewDialog } from "@/components/pages/taskDetail/image-preview-dialog";
import type { Member } from "@/types/domain";
import { roleLabels } from "./constants";

export type TaskCreateDraftSubmit = {
  assigneeId: number;
  attachments: File[];
  category: TaskCategory;
  description: string;
  oneLineComment?: string;
  title: string;
};

type TaskCreateFormProps = {
  accessToken: string;
  assignees: Member[];
  isLoading: boolean;
  isSubmitting: boolean;
  onPublished: () => Promise<void>;
  onSubmit: (request: TaskCreateDraftSubmit) => Promise<void>;
};

type TaskDraftForm = {
  assigneeId: string;
  attachments: File[];
  attachmentNames: string[];
  category: TaskCategory;
  description: string;
  draftId: number | null;
  id: number;
  isSaved: boolean;
  oneLineComment: string;
  title: string;
};

type FlatPosition = PositionTreeNode & {
  depth: number;
};

const categoryOptions: Array<{ label: string; value: TaskCategory }> = [
  { label: "개발 관련", value: "DEVELOPMENT" },
  { label: "운영 관련", value: "OPERATION" },
  { label: "회원 관련", value: "MEMBER" },
  { label: "주문 관련", value: "ORDER" }
];

const createEmptyDraft = (id: number): TaskDraftForm => ({
  assigneeId: "",
  attachments: [],
  attachmentNames: [],
  category: "OPERATION",
  description: "",
  draftId: null,
  id,
  isSaved: false,
  oneLineComment: "",
  title: ""
});

export function TaskCreateForm({
  accessToken,
  assignees,
  isLoading,
  isSubmitting,
  onPublished,
  onSubmit
}: TaskCreateFormProps) {
  const [drafts, setDrafts] = useState<TaskDraftForm[]>([createEmptyDraft(1)]);
  const [message, setMessage] = useState("");
  const [positions, setPositions] = useState<PositionTreeNode[]>([]);
  const [isDraftLoading, setIsDraftLoading] = useState(true);
  const [isPositionLoading, setIsPositionLoading] = useState(true);
  const [isPositionTreeCollapsed, setIsPositionTreeCollapsed] = useState(false);
  const [savingDraftId, setSavingDraftId] = useState<number | null>(null);

  const sortedAssignees = useMemo(() => {
    return [...assignees].sort((first, second) => {
      const firstLabel = `${getMemberPositionName(first)}-${getMemberDisplayName(first)}`;
      const secondLabel = `${getMemberPositionName(second)}-${getMemberDisplayName(second)}`;
      return firstLabel.localeCompare(secondLabel, "ko");
    });
  }, [assignees]);

  const flatPositions = useMemo(() => flattenPositions(positions), [positions]);

  useEffect(() => {
    async function loadDrafts() {
      try {
        const savedDrafts = await getTaskDrafts(accessToken);
        const draftForms = savedDrafts.map((draft, index) => ({
          assigneeId: String(draft.assigneeId),
          attachments: [],
          attachmentNames: [],
          category: draft.category,
          description: draft.description,
          draftId: draft.id,
          id: index + 1,
          isSaved: true,
          oneLineComment: draft.oneLineComment ?? "",
          title: draft.title
        }));
        setDrafts([...draftForms, createEmptyDraft(draftForms.length + 1)]);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "임시저장 업무를 불러오지 못했습니다.");
      } finally {
        setIsDraftLoading(false);
      }
    }

    void loadDrafts();
  }, [accessToken]);

  useEffect(() => {
    async function loadPositions() {
      try {
        setPositions(await getPositionTree());
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "직위트리를 불러오지 못했습니다.");
      } finally {
        setIsPositionLoading(false);
      }
    }

    void loadPositions();
  }, []);

  function updateDraft(id: number, updater: (draft: TaskDraftForm) => TaskDraftForm) {
    setDrafts((currentDrafts) =>
      currentDrafts.map((draft) => (draft.id === id ? updater(draft) : draft))
    );
  }

  function handleFileChange(id: number, event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    updateDraft(id, (draft) => ({
      ...draft,
      attachments: files,
      attachmentNames: files.map((file) => file.name)
    }));
  }

  async function handleSaveDraft(id: number) {
    setMessage("");
    const targetDraft = drafts.find((draft) => draft.id === id);

    if (!targetDraft?.assigneeId || !targetDraft.title.trim()) {
      setMessage("직원과 업무 제목을 입력해주세요.");
      return;
    }

    setSavingDraftId(id);

    try {
      const request = {
        assigneeId: Number(targetDraft.assigneeId),
        category: targetDraft.category,
        description: targetDraft.description,
        oneLineComment: targetDraft.oneLineComment.trim() || undefined,
        title: targetDraft.title
      };
      const savedDraft = targetDraft.draftId
        ? await updateTaskDraft(accessToken, targetDraft.draftId, request)
        : await createTaskDraft(accessToken, request);

      setDrafts((currentDrafts) => {
        const savedDrafts = currentDrafts.map((draft) =>
          draft.id === id
            ? {
                ...draft,
                assigneeId: String(savedDraft.assigneeId),
                attachments: [],
                category: savedDraft.category,
                description: savedDraft.description,
                draftId: savedDraft.id,
                isSaved: true,
                oneLineComment: savedDraft.oneLineComment ?? "",
                title: savedDraft.title
              }
            : draft
        );
        const hasEditableEmptyDraft = savedDrafts.some(isEmptyEditableDraft);

        if (hasEditableEmptyDraft) {
          return savedDrafts;
        }

        const nextId = Math.max(...savedDrafts.map((draft) => draft.id)) + 1;
        return [...savedDrafts, createEmptyDraft(nextId)];
      });
      setMessage("업무가 임시저장되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "업무를 임시저장하지 못했습니다.");
    } finally {
      setSavingDraftId(null);
    }
  }

  function handleEditDraft(id: number) {
    setMessage("");
    updateDraft(id, (draft) => ({ ...draft, isSaved: false }));
  }

  async function handleSubmitDraft(draft: TaskDraftForm) {
    setMessage("");

    if (!draft.assigneeId || !draft.title.trim() || !draft.description.trim()) {
      setMessage("직원, 업무 제목, 상세 설명을 모두 입력해주세요.");
      return;
    }

    if (draft.draftId) {
      await updateTaskDraft(accessToken, draft.draftId, {
        assigneeId: Number(draft.assigneeId),
        category: draft.category,
        description: draft.description,
        oneLineComment: draft.oneLineComment.trim() || undefined,
        title: draft.title
      });
      await publishTaskDraft(accessToken, draft.draftId);
      await onPublished();
    } else {
      await onSubmit({
        assigneeId: Number(draft.assigneeId),
        attachments: draft.attachments,
        category: draft.category,
        description: draft.description,
        oneLineComment: draft.oneLineComment.trim() || undefined,
        title: draft.title
      });
    }

    setDrafts((currentDrafts) => {
      const remainingDrafts = currentDrafts.filter((currentDraft) => currentDraft.id !== draft.id);
      const hasEditableEmptyDraft = remainingDrafts.some(isEmptyEditableDraft);

      if (remainingDrafts.length === 0) {
        return [createEmptyDraft(1)];
      }

      if (hasEditableEmptyDraft) {
        return remainingDrafts;
      }

      const nextId = Math.max(...remainingDrafts.map((currentDraft) => currentDraft.id)) + 1;
      return [...remainingDrafts, createEmptyDraft(nextId)];
    });
  }

  return (
    <section className="rounded-[22px] border border-[#D9D5D2] bg-[#FFFEFC] px-4 py-5 shadow-[0_6px_0_#DDD6D2]">
      <div className="text-center">
        <h2 className="flex items-center justify-center gap-1.5 text-[18px] font-normal text-[#222222]">
          새 업무 작성
          <Pencil aria-hidden className="h-4 w-4 text-[#222222]" />
        </h2>
        <p className="mt-2 text-[13px] font-normal text-[#7B716D] drop-shadow-[0_2px_1px_rgba(95,73,68,0.24)]">
          오늘도 화이팅
        </p>
      </div>

      <div className="my-4 border-t border-dashed border-[#CFC7C3]" />

      {message && (
        <p className="mb-3 rounded-[12px] bg-[#FFF2F2] px-3 py-2 text-[11px] font-normal text-[#D83A42]">
          {message}
        </p>
      )}

      {isDraftLoading && (
        <div className="rounded-[14px] border border-dashed border-[#D8D1CE] bg-white px-4 py-6 text-center text-[11px] font-normal text-[#7B716D]">
          임시저장 업무를 불러오는 중입니다.
        </div>
      )}

      {!isDraftLoading && drafts.map((draft) => (
        <TaskDraftCard
          assignees={sortedAssignees}
          draft={draft}
          flatPositions={flatPositions}
          isLoading={isLoading || isPositionLoading}
          isPositionTreeCollapsed={isPositionTreeCollapsed}
          isSaving={savingDraftId === draft.id}
          isSubmitting={isSubmitting}
          key={draft.id}
          onAttachmentChange={handleFileChange}
          onEdit={handleEditDraft}
          onPositionTreeCollapseToggle={() => setIsPositionTreeCollapsed((currentValue) => !currentValue)}
          onSave={handleSaveDraft}
          onSubmit={handleSubmitDraft}
          onUpdate={updateDraft}
        />
      ))}
    </section>
  );
}

function TaskDraftCard({
  assignees,
  draft,
  flatPositions,
  isLoading,
  isPositionTreeCollapsed,
  isSaving,
  isSubmitting,
  onAttachmentChange,
  onEdit,
  onPositionTreeCollapseToggle,
  onSave,
  onSubmit,
  onUpdate
}: {
  assignees: Member[];
  draft: TaskDraftForm;
  flatPositions: FlatPosition[];
  isLoading: boolean;
  isPositionTreeCollapsed: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  onAttachmentChange: (id: number, event: ChangeEvent<HTMLInputElement>) => void;
  onEdit: (id: number) => void;
  onPositionTreeCollapseToggle: () => void;
  onSave: (id: number) => void;
  onSubmit: (draft: TaskDraftForm) => Promise<void>;
  onUpdate: (id: number, updater: (draft: TaskDraftForm) => TaskDraftForm) => void;
}) {
  const isLocked = draft.isSaved;
  const isDisabled = isLocked || isSaving || isSubmitting || isLoading;
  const attachmentInputId = `task-attachment-${draft.id}`;
  const selectedAssignee = assignees.find((member) => String(member.id) === draft.assigneeId);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(selectedAssignee?.positionId ?? null);

  const positionAssignees = useMemo(() => {
    if (!selectedPositionId) {
      return [];
    }

    return assignees.filter((member) => member.positionId === selectedPositionId);
  }, [assignees, selectedPositionId]);

  const searchedAssignees = useMemo(() => {
    const keyword = normalizeSearchText(searchKeyword);

    if (!keyword) {
      return [];
    }

    return assignees.filter((member) => {
      const name = normalizeSearchText(getMemberDisplayName(member));
      const position = normalizeSearchText(getMemberPositionName(member));
      return name.includes(keyword) || position.includes(keyword);
    });
  }, [assignees, searchKeyword]);

  function selectAssignee(memberId: number) {
    const member = assignees.find((candidate) => candidate.id === memberId);
    setSelectedPositionId(member?.positionId ?? null);
    onUpdate(draft.id, (currentDraft) => ({
      ...currentDraft,
      assigneeId: String(memberId)
    }));
  }

  function selectPosition(positionId: number) {
    setSelectedPositionId(positionId);
  }

  return (
    <article className="space-y-4">
      {isLocked && (
        <div className="rounded-[10px] bg-[#F1F1F1] px-3 py-2 text-center text-[10px] font-normal text-[#6B6B6B]">
          임시저장됨
        </div>
      )}

      <section>
        <div className="flex items-center gap-1.5 text-[13px] font-normal text-[#222222]">
          <Search aria-hidden className="h-4 w-4 text-[#222222]" />
          <span>담당자 찾기</span>
        </div>
        <input
          className="mt-2 h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-white px-3 text-[12px] font-normal text-[#222222] outline-none placeholder:text-[#9A918D] disabled:opacity-60"
          disabled={isDisabled}
          onChange={(event) => setSearchKeyword(event.target.value)}
          placeholder="이름 또는 직위로 검색하세요"
          value={searchKeyword}
        />
        {searchedAssignees.length > 0 && (
          <div className="mt-2 max-h-[118px] space-y-1 overflow-y-auto rounded-[12px] border border-[#E4DCD9] bg-white p-1.5">
            {searchedAssignees.map((member) => (
              <button
                className="flex h-8 w-full items-center justify-between rounded-[8px] px-2 text-left text-[11px] font-normal text-[#333333] hover:bg-[#F5FAFF] disabled:opacity-60"
                disabled={isDisabled}
                key={member.id}
                onClick={() => selectAssignee(member.id)}
                type="button"
              >
                <span>{getMemberDisplayName(member)}</span>
                <span className="text-[10px] text-[#7B716D]">{getMemberPositionName(member)}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[14px] border border-[#D8D1CE] bg-[#F9F7F6] p-3">
        <button
          aria-expanded={!isPositionTreeCollapsed}
          className="flex h-8 w-full items-center justify-between text-[12px] font-normal text-[#333333]"
          onClick={onPositionTreeCollapseToggle}
          type="button"
        >
          <span>직위트리</span>
          <span className="flex items-center gap-1 text-[10px] text-[#7B716D]">
            {isPositionTreeCollapsed ? "펼치기" : "접어두기"}
            {isPositionTreeCollapsed ? (
              <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown aria-hidden className="h-3.5 w-3.5" />
            )}
          </span>
        </button>

        {!isPositionTreeCollapsed && (
          <div className="mt-2 max-h-[154px] space-y-1 overflow-y-auto">
            {flatPositions.map((position) => {
              const hasAssignees = assignees.some((member) => member.positionId === position.id);
              const isSelected = selectedPositionId === position.id;

              return (
                <button
                  className={`flex h-8 w-full items-center rounded-[8px] border px-2 text-left text-[11px] font-normal transition disabled:opacity-45 ${
                    isSelected
                      ? "border-[#9CC7F2] bg-[#EAF3FF] text-[#2D70CB]"
                      : "border-transparent bg-white text-[#4F4542] hover:border-[#E4DCD9]"
                  }`}
                  disabled={isDisabled || !hasAssignees}
                  key={position.id}
                  onClick={() => selectPosition(position.id)}
                  style={{ paddingLeft: `${8 + position.depth * 14}px` }}
                  type="button"
                >
                  {position.name}
                </button>
              );
            })}
          </div>
        )}

        {selectedPositionId && (
          <select
            className="mt-2 h-9 w-full rounded-[10px] border border-[#D8D1CE] bg-white px-3 text-[12px] font-normal text-[#333333] outline-none disabled:opacity-60"
            disabled={isDisabled || positionAssignees.length === 0}
            onChange={(event) => {
              if (event.target.value) {
                selectAssignee(Number(event.target.value));
              }
            }}
            value={draft.assigneeId}
          >
            <option value="">해당 직위 직원 선택</option>
            {positionAssignees.map((member) => (
              <option key={member.id} value={member.id}>
                {getMemberDisplayName(member)}
              </option>
            ))}
          </select>
        )}
      </section>

      <section className="space-y-3 rounded-[16px] border border-[#D8D1CE] bg-white p-3">
        <label className="block">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-normal text-[#7B716D]">
            <span>제목</span>
            <span className="min-w-0 truncate text-[#333333]">
              담당자 : {selectedAssignee ? getMemberDisplayName(selectedAssignee) : "미선택"}
            </span>
          </div>
          <input
            className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#9A918D] disabled:opacity-60"
            disabled={isDisabled}
            onChange={(event) =>
              onUpdate(draft.id, (currentDraft) => ({
                ...currentDraft,
                title: event.target.value
              }))
            }
            placeholder="업무 제목"
            value={draft.title}
          />
        </label>

        <textarea
          className="h-28 w-full resize-none rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 py-3 text-[13px] font-normal leading-6 text-[#222222] outline-none placeholder:text-[#9A918D] disabled:opacity-60"
          disabled={isDisabled}
          onChange={(event) =>
            onUpdate(draft.id, (currentDraft) => ({
              ...currentDraft,
              description: event.target.value
            }))
          }
          placeholder="내용"
          value={draft.description}
        />

        <label
          className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-[#B9D5EF] bg-[#F5FAFF] text-[11px] font-normal text-[#2D70CB] ${
            isDisabled ? "pointer-events-none opacity-60" : ""
          }`}
          htmlFor={attachmentInputId}
        >
          <ImagePlus aria-hidden className="h-4 w-4" />
          사진 첨부
        </label>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={isDisabled}
          id={attachmentInputId}
          multiple
          onChange={(event) => onAttachmentChange(draft.id, event)}
          type="file"
        />
        {draft.attachments.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {draft.attachments.map((attachment) => (
              <AttachmentPreview
                attachment={attachment}
                key={`${attachment.name}-${attachment.lastModified}-${attachment.size}`}
                onPreview={setPreviewImageUrl}
              />
            ))}
          </div>
        )}

        <input
          className="h-10 w-full rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[13px] font-normal text-[#222222] outline-none placeholder:text-[#9A918D] disabled:opacity-60"
          disabled={isDisabled}
          onChange={(event) =>
            onUpdate(draft.id, (currentDraft) => ({
              ...currentDraft,
              oneLineComment: event.target.value
            }))
          }
          placeholder="한 줄 멘트를 입력해주세요."
          value={draft.oneLineComment}
        />

        <div className="grid grid-cols-4 gap-1.5">
          {categoryOptions.map((option) => {
            const isSelected = draft.category === option.value;

            return (
              <button
                className={`h-8 rounded-[8px] border px-1 text-[9px] font-normal transition disabled:opacity-60 ${
                  isSelected
                    ? getCategoryButtonClassName(option.value)
                    : "border-[#D8D1CE] bg-white text-[#6F6662]"
                }`}
                disabled={isDisabled}
                key={option.value}
                onClick={() =>
                  onUpdate(draft.id, (currentDraft) => ({
                    ...currentDraft,
                    category: option.value
                  }))
                }
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-1.5">
        <button
          className="h-9 rounded-[9px] border border-[#D8D1CE] bg-[#F3F1EF] px-2 text-[10px] font-normal text-[#6F6662] transition hover:bg-[#EBE7E4] disabled:opacity-60"
          disabled={!isLocked || isSaving || isSubmitting || isLoading}
          onClick={() => onEdit(draft.id)}
          type="button"
        >
          수정
        </button>
        <button
          className="h-9 rounded-[9px] border border-[#F0C5D2] bg-[#FFF3F7] px-2 text-[10px] font-normal text-[#D93D72] transition hover:bg-[#FFEAF2] disabled:opacity-60"
          disabled={isLocked || isSaving || isSubmitting || isLoading}
          onClick={() => void onSave(draft.id)}
          type="button"
        >
          {isSaving ? "저장 중" : "임시저장"}
        </button>
        <button
          className="h-9 rounded-[9px] border border-[#B9D5EF] bg-[#EAF3FF] px-2 text-[10px] font-normal text-[#2D70CB] transition hover:bg-[#DDEEFF] disabled:opacity-60"
          disabled={isLocked || isSaving || isSubmitting || isLoading}
          onClick={() => void onSubmit(draft)}
          type="button"
        >
          {isSubmitting ? "등록 중" : "업무 등록"}
        </button>
      </div>

      {previewImageUrl && (
        <ImagePreviewDialog imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
      )}
    </article>
  );
}

function AttachmentPreview({
  attachment,
  onPreview
}: {
  attachment: File;
  onPreview: (imageUrl: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(attachment);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [attachment]);

  return (
    <button
      aria-label={`${attachment.name} 크게 보기`}
      className="w-[58px] shrink-0 overflow-hidden rounded-[8px] border border-[#D8D1CE] bg-white p-1"
      onClick={() => onPreview(previewUrl)}
      type="button"
    >
      {previewUrl && (
        <img
          alt=""
          className="aspect-square w-full rounded-[6px] object-cover"
          src={previewUrl}
        />
      )}
    </button>
  );
}

function isEmptyEditableDraft(draft: TaskDraftForm) {
  return (
    !draft.isSaved &&
    !draft.assigneeId &&
    !draft.title &&
    !draft.description &&
    !draft.oneLineComment
  );
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

function normalizeSearchText(value: string) {
  return value.trim().replace(/\s/g, "").toLocaleLowerCase("ko-KR");
}

function getCategoryButtonClassName(category: TaskCategory) {
  if (category === "DEVELOPMENT") {
    return "border-[#9CC7F2] bg-[#EAF3FF] text-[#2D70CB]";
  }

  if (category === "OPERATION") {
    return "border-[#F2B3BA] bg-[#FFEDEF] text-[#D83A42]";
  }

  if (category === "MEMBER") {
    return "border-[#CDBDFF] bg-[#F7F3FF] text-[#8B5CF6]";
  }

  return "border-[#F0CF63] bg-[#FFF6D8] text-[#9A7416]";
}

function getMemberPositionName(member: Member): string {
  return member.positionInfo?.name ?? roleLabels[member.roleType];
}

function getMemberDisplayName(member: Member): string {
  return member.displayName ?? member.name;
}
