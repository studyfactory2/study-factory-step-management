import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  createTaskDraft,
  getTaskDrafts,
  publishTaskDraft,
  updateTaskDraft
} from "@/api/task";
import type { Member } from "@/types/domain";
import { roleLabels } from "./constants";

export type TaskCreateDraftSubmit = {
  assigneeId: number;
  attachments: File[];
  description: string;
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
  description: string;
  draftId: number | null;
  id: number;
  isSaved: boolean;
  title: string;
};

const createEmptyDraft = (id: number): TaskDraftForm => ({
  assigneeId: "",
  attachments: [],
  attachmentNames: [],
  description: "",
  draftId: null,
  id,
  isSaved: false,
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
  const [isDraftLoading, setIsDraftLoading] = useState(true);
  const [savingDraftId, setSavingDraftId] = useState<number | null>(null);

  const sortedAssignees = useMemo(() => {
    return [...assignees].sort((first, second) => {
      const firstLabel = `${getMemberPositionName(first)}-${getMemberDisplayName(first)}`;
      const secondLabel = `${getMemberPositionName(second)}-${getMemberDisplayName(second)}`;
      return firstLabel.localeCompare(secondLabel, "ko");
    });
  }, [assignees]);

  useEffect(() => {
    async function loadDrafts() {
      try {
        const savedDrafts = await getTaskDrafts(accessToken);
        const draftForms = savedDrafts.map((draft, index) => ({
          assigneeId: String(draft.assigneeId),
          attachments: [],
          attachmentNames: [],
          description: draft.description,
          draftId: draft.id,
          id: index + 1,
          isSaved: true,
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
        description: targetDraft.description,
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
                description: savedDraft.description,
                draftId: savedDraft.id,
                isSaved: true,
                title: savedDraft.title
              }
            : draft
        );
        const hasEditableEmptyDraft = savedDrafts.some((draft) => {
          return !draft.isSaved && !draft.assigneeId && !draft.title && !draft.description;
        });

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
        description: draft.description,
        title: draft.title
      });
      await publishTaskDraft(accessToken, draft.draftId);
      await onPublished();
    } else {
      await onSubmit({
        assigneeId: Number(draft.assigneeId),
        attachments: draft.attachments,
        description: draft.description,
        title: draft.title
      });
    }

    setDrafts((currentDrafts) => {
      const remainingDrafts = currentDrafts.filter((currentDraft) => currentDraft.id !== draft.id);
      const hasEditableEmptyDraft = remainingDrafts.some((currentDraft) => {
        return !currentDraft.isSaved && !currentDraft.assigneeId && !currentDraft.title && !currentDraft.description;
      });

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
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-5 py-6 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-semibold text-[#5A3E3B]">새 업무 등록</h2>
      {message && (
        <p className="mt-4 rounded-2xl bg-[#FFF8F6] px-5 py-3 text-sm font-black text-primary">
          {message}
        </p>
      )}
      <div className="mt-7 space-y-5">
        {isDraftLoading && (
          <div className="rounded-[20px] border border-dashed border-[#F2C9C2] bg-white px-6 py-8 text-center text-sm font-black text-[#9B7A75]">
            임시저장 업무를 불러오는 중입니다.
          </div>
        )}
        {!isDraftLoading && drafts.map((draft, index) => (
          <TaskDraftCard
            assignees={sortedAssignees}
            draft={draft}
            index={index}
            isLoading={isLoading}
            isSaving={savingDraftId === draft.id}
            isSubmitting={isSubmitting}
            key={draft.id}
            onAttachmentChange={handleFileChange}
            onEdit={handleEditDraft}
            onSave={handleSaveDraft}
            onSubmit={handleSubmitDraft}
            onUpdate={updateDraft}
          />
        ))}
      </div>
    </section>
  );
}

function TaskDraftCard({
  assignees,
  draft,
  index,
  isLoading,
  isSaving,
  isSubmitting,
  onAttachmentChange,
  onEdit,
  onSave,
  onSubmit,
  onUpdate
}: {
  assignees: Member[];
  draft: TaskDraftForm;
  index: number;
  isLoading: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  onAttachmentChange: (id: number, event: ChangeEvent<HTMLInputElement>) => void;
  onEdit: (id: number) => void;
  onSave: (id: number) => void;
  onSubmit: (draft: TaskDraftForm) => Promise<void>;
  onUpdate: (id: number, updater: (draft: TaskDraftForm) => TaskDraftForm) => void;
}) {
  const isLocked = draft.isSaved;
  const attachmentInputId = `task-attachment-${draft.id}`;

  return (
    <article className="rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-black text-primary">업무 {index + 1}</p>
        {isLocked && (
          <span className="rounded-full bg-[#E8F3DF] px-4 py-1.5 text-xs font-black text-[#6D956A]">
            임시저장됨
          </span>
        )}
      </div>
      <div className="grid gap-4 ">
        <select
          className="min-h-[52px] rounded-[12px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-5 text-base font-bold text-[#8F7470] outline-none disabled:opacity-70"
          disabled={isLocked || isSaving || isSubmitting || isLoading}
          onChange={(event) =>
            onUpdate(draft.id, (currentDraft) => ({
              ...currentDraft,
              assigneeId: event.target.value
            }))
          }
          value={draft.assigneeId}
        >
          <option value="">직원 선택</option>
          {assignees.map((member) => (
            <option key={member.id} value={member.id}>
              {getMemberPositionName(member)}-{getMemberDisplayName(member)}
            </option>
          ))}
        </select>
        <input
          className="h-[52px] w-full rounded-[12px] border-2 border-[#F2C9C2] bg-[#FFF8F6] px-5 text-base font-bold outline-none placeholder:text-[#B79A94] disabled:opacity-70"
          disabled={isLocked || isSaving || isSubmitting || isLoading}
          onChange={(event) =>
            onUpdate(draft.id, (currentDraft) => ({
              ...currentDraft,
              title: event.target.value
            }))
          }
          placeholder="업무 제목"
          value={draft.title}
        />
      </div>
      <div className="mt-4 rounded-[16px] border-2 border-[#F2C9C2] bg-[#FFF8F6] p-4">
        <textarea
          className="h-28 w-full resize-none bg-transparent text-base font-bold leading-7 outline-none placeholder:text-[#B79A94] disabled:opacity-70"
          disabled={isLocked || isSaving || isSubmitting || isLoading}
          onChange={(event) =>
            onUpdate(draft.id, (currentDraft) => ({
              ...currentDraft,
              description: event.target.value
            }))
          }
          placeholder="상세 설명"
          value={draft.description}
        />
        <label
          className={`mt-4 flex min-h-[68px] cursor-pointer items-center justify-center rounded-[14px] border-2 border-dashed border-[#F2C9C2] bg-white px-5 text-center text-sm font-black text-[#9B7A75] ${
            isLocked || isSaving || isSubmitting || isLoading ? "pointer-events-none opacity-70" : ""
          }`}
          htmlFor={attachmentInputId}
        >
          {draft.attachmentNames.length > 0
            ? draft.attachmentNames.join(", ")
            : "사진 또는 수기메모를 첨부하려면 이 영역을 선택하세요"}
        </label>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={isLocked || isSaving || isSubmitting || isLoading}
          id={attachmentInputId}
          multiple
          onChange={(event) => onAttachmentChange(draft.id, event)}
          type="file"
        />
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button
          className="min-h-[52px] rounded-full border border-[#D9D1F3] bg-[#F7F3FF] px-10 text-base font-black text-[#8B72C8] transition hover:bg-[#F0EAFF] disabled:opacity-60"
          disabled={!isLocked || isSaving || isSubmitting || isLoading}
          onClick={() => onEdit(draft.id)}
          type="button"
        >
          수정
        </button>
        <button
          className="min-h-[52px] rounded-full border border-[#F0B9C8] bg-white px-10 text-base font-black text-primary transition hover:bg-[#FFF7F8] disabled:opacity-60"
          disabled={isLocked || isSaving || isSubmitting || isLoading}
          onClick={() => void onSave(draft.id)}
          type="button"
        >
          {isSaving ? "저장 중" : "임시저장"}
        </button>
        <button
          className="min-h-[52px] rounded-full bg-primary px-12 text-base font-black text-white disabled:opacity-60"
          disabled={isLocked || isSaving || isSubmitting || isLoading}
          onClick={() => void onSubmit(draft)}
          type="button"
        >
          {isSubmitting ? "등록 중" : "업무 등록"}
        </button>
      </div>
    </article>
  );
}

function getMemberPositionName(member: Member): string {
  return member.positionInfo?.name ?? roleLabels[member.roleType];
}

function getMemberDisplayName(member: Member): string {
  return member.displayName ?? member.name;
}
