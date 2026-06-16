"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  FilePenLine,
  Globe2,
  ImagePlus,
  Megaphone,
  MessageCircle,
  Pencil,
  Tag,
  UserRound,
  X
} from "lucide-react";
import {
  createBoardPost,
  getBoardCategories,
  type BoardPostCategory,
  type BoardPostType,
  type BoardVisibility
} from "@/api/board";
import { getStoredAuth, isAdminRole, type StoredMember } from "@/lib/auth-storage";

type AttachmentDeleteTarget = {
  index: number;
  name: string;
} | null;

const categoryStyles = {
  pink: "bg-[#FFE4EC] text-[#EC4D7B] border-[#F7B7C9]",
  green: "bg-[#DFF6E8] text-[#228C50] border-[#9BD7B5]",
  yellow: "bg-[#FFF0C7] text-[#D28A00] border-[#F1C86D]",
  blue: "bg-[#DFF0FF] text-[#1676D2] border-[#9CC7F1]",
  orange: "bg-[#FFE8C7] text-[#B76500] border-[#E9BE7B]",
  purple: "bg-[#E9DDFF] text-[#7556D8] border-[#C7B4F2]"
} as const;

export default function BoardPostCreatePage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);
  const [categories, setCategories] = useState<BoardPostCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedPostType, setSelectedPostType] = useState<BoardPostType>("EMPLOYEE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [oneLineComment, setOneLineComment] = useState("");
  const [visibility, setVisibility] = useState<BoardVisibility>("ALL");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [attachmentDeleteTarget, setAttachmentDeleteTarget] = useState<AttachmentDeleteTarget>(null);

  const attachmentPreviews = useMemo(() => {
    return attachments.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [attachmentPreviews]);

  useEffect(() => {
    const auth = getStoredAuth();

    if (!auth.accessToken || !auth.currentMember) {
      router.replace("/");
      return;
    }

    setAccessToken(auth.accessToken);
    setCurrentMember(auth.currentMember);
    resetForm();

    async function loadCategories() {
      try {
        setCategories(await getBoardCategories(auth.accessToken));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "카테고리를 불러오지 못했습니다.");
      }
    }

    void loadCategories();
  }, [router]);

  if (!currentMember) {
    return null;
  }

  const organizationLabel = currentMember.organizationName ?? currentMember.branch ?? "소속 미정";
  const positionLabel = currentMember.positionName ?? (currentMember.name === "김태환" ? "개발자" : "사원");
  const canCreateNotice = isAdminRole(currentMember.roleType);
  const isNoticeSelected = selectedPostType === "NOTICE";

  function handleNoticeClick() {
    if (!canCreateNotice) {
      return;
    }

    setSelectedPostType((currentType) => {
      const nextType = currentType === "NOTICE" ? "EMPLOYEE" : "NOTICE";

      if (nextType === "NOTICE") {
        setSelectedCategoryIds([]);
      }

      return nextType;
    });
  }

  function handleCategoryClick(categoryId: number) {
    setSelectedPostType("EMPLOYEE");
    setSelectedCategoryIds((currentIds) => {
      if (currentIds.includes(categoryId)) {
        return currentIds.filter((id) => id !== categoryId);
      }

      if (currentIds.length >= 2) {
        return currentIds;
      }

      return [...currentIds, categoryId];
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 5 - attachments.length);
    setAttachments((currentFiles) => [...currentFiles, ...files].slice(0, 5));
    event.target.value = "";
  }

  function handleAttachmentRemove(index: number) {
    setAttachments((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
  }

  function resetForm() {
    setAttachments([]);
    setContent("");
    setMessage("");
    setOneLineComment("");
    setSelectedCategoryIds([]);
    setSelectedPostType("EMPLOYEE");
    setTitle("");
    setVisibility("ALL");
  }

  function handleAttachmentDeleteRequest(index: number) {
    const attachment = attachments[index];

    if (!attachment) {
      return;
    }

    setAttachmentDeleteTarget({
      index,
      name: attachment.name
    });
  }

  function handleAttachmentDeleteConfirm() {
    if (!attachmentDeleteTarget) {
      return;
    }

    handleAttachmentRemove(attachmentDeleteTarget.index);
    setAttachmentDeleteTarget(null);
  }

  async function handleSubmit() {
    setMessage("");

    if (!title.trim()) {
      setMessage("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      setMessage("본문 내용을 입력해주세요.");
      return;
    }

    if (!isNoticeSelected && selectedCategoryIds.length === 0) {
      setMessage("카테고리를 1개 이상 선택해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createBoardPost(accessToken, {
        attachments,
        categoryIds: selectedCategoryIds,
        content: content.trim(),
        oneLineComment: oneLineComment.trim() || undefined,
        postType: selectedPostType,
        title: title.trim(),
        visibility
      });

      router.push(`/board/${response.postId}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "게시글을 등록하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="mx-auto w-full max-w-[380px] pb-8">
        <header className="relative mb-4 pt-1 text-center">
          <button
            className="absolute left-0 top-0 flex min-h-0 items-center rounded-[10px] border border-[#D8D1CE] bg-white px-2.5 py-0 text-[12px] font-bold leading-6 text-[#333333] shadow-sm"
            onClick={() => router.push("/board")}
            type="button"
          >
            ←
          </button>
          <h1 className="flex items-center justify-center gap-1.5 text-[24px] font-normal leading-tight text-[#111111]">
            {isNoticeSelected ? (
              <Megaphone aria-hidden className="h-7 w-8 -translate-y-0.5 scale-y-125 text-[#F04D6E]" />
            ) : (
              <Pencil aria-hidden className="h-7 w-7 -translate-y-0.5 text-[#E3A12A]" />
            )}
            {isNoticeSelected ? "공지사항 작성" : "사원게시물 작성"}
          </h1>
        </header>

        {message ? (
          <div className="mb-3 rounded-[12px] border border-[#D8D1CE] bg-white px-3 py-2 text-center text-[12px] font-normal text-[#B94C4C]">
            {message}
          </div>
        ) : null}

        <section className="relative mb-3 rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <span className="absolute right-3 top-3 whitespace-nowrap text-[12px] font-normal text-[#7B716D]">{formatNow()}</span>
          <h2 className="mb-2 flex items-center gap-1.5 text-[18px] font-normal text-[#111111]">
            <UserRound aria-hidden className="h-5 w-5 text-[#4F4542]" />
            작성자
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD9E6] text-[19px] text-[#D82459]">
                {currentMember.name.slice(0, 1)}
              </span>
              <p className="min-w-0 truncate text-[12px] font-normal text-[#7B716D]">
                <span className="text-[14px] text-[#1171E8]">{currentMember.name}</span>
                <span className="ml-1">{positionLabel} - {organizationLabel}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="mb-3 rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[18px] font-normal text-[#111111]">
              <Tag aria-hidden className="h-5 w-5 text-[#E3A12A]" />
              카테고리 선택
            </h2>
            <span className="text-[12px] font-normal text-[#7B716D]">{isNoticeSelected ? "(공지사항)" : "(최대 2개)"}</span>
          </div>
          <div className="space-y-1.5">
            {canCreateNotice ? (
              <button
                className={`flex h-9 w-full min-w-0 items-center justify-start gap-1.5 rounded-[10px] border px-2 text-[12px] font-normal leading-3 ${
                  isNoticeSelected
                    ? "border-[#F7B7C9] bg-[#FFE4EC] text-[#EC4D7B]"
                    : "border-[#D8D1CE] bg-white text-[#6F6662]"
                }`}
                onClick={handleNoticeClick}
                type="button"
              >
                <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border border-[#9B9592] bg-white text-[8px] text-[#4F4542]">
                  {isNoticeSelected ? <Check aria-hidden className="h-2.5 w-2.5" /> : null}
                </span>
                <span className="inline-flex min-w-0 items-center gap-1 truncate">
                  <Megaphone aria-hidden className="h-4 w-4 shrink-0 scale-y-125" />
                  공지사항
                </span>
              </button>
            ) : null}

            {!isNoticeSelected ? (
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((category) => {
                  const isSelected = selectedCategoryIds.includes(category.id);

                  return (
                    <button
                      className={`flex h-9 min-w-0 items-center justify-start gap-1.5 rounded-[10px] border px-2 text-[12px] font-normal leading-3 ${
                        isSelected ? getCategoryClassName(category) : "border-[#D8D1CE] bg-white text-[#6F6662]"
                      }`}
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      type="button"
                    >
                      <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border border-[#9B9592] bg-white text-[8px] text-[#4F4542]">
                        {isSelected ? <Check aria-hidden className="h-2.5 w-2.5" /> : null}
                      </span>
                      <span className="max-w-full truncate">
                        <span aria-hidden>{category.icon}</span>
                        {" "}
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mb-3 rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <h2 className="mb-2 flex items-center gap-1.5 text-[18px] font-normal text-[#111111]">
            <FilePenLine aria-hidden className="h-5 w-5 text-[#2D70CB]" />
            제목
          </h2>
          <div className="flex h-10 items-center gap-2 rounded-[12px] border border-[#D8D1CE] bg-white px-3">
            <input
              className="min-w-0 flex-1 bg-transparent text-[15px] font-normal text-[#111111] outline-none placeholder:text-[#9B9592]"
              maxLength={40}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력해주세요"
              value={title}
            />
            <p className="shrink-0 text-[12px] font-normal text-[#7B716D]">{title.length} / 40</p>
          </div>
        </section>

        <section className="mb-3 rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <h2 className="mb-2 flex items-center gap-1.5 text-[18px] font-normal text-[#111111]">
            <FilePenLine aria-hidden className="h-5 w-5 text-[#2D70CB]" />
            본문 내용
          </h2>
          <div className="rounded-[12px] border border-[#D8D1CE] bg-white px-3 py-2">
            <textarea
              className="min-h-[150px] w-full resize-none bg-transparent text-[15px] font-normal leading-6 text-[#111111] outline-none placeholder:text-[#9B9592]"
              maxLength={500}
              onChange={(event) => setContent(event.target.value)}
              placeholder="내용을 자유롭게 작성해주세요 ✏️"
              value={content}
            />
            <p className="text-right text-[12px] font-normal text-[#7B716D]">{content.length} / 500</p>
          </div>
        </section>

        <section className="mb-3 rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[18px] font-normal text-[#111111]">
              <Camera aria-hidden className="h-5 w-5 text-[#4F4542]" />
              사진 첨부
            </h2>
            <span className="text-[12px] font-normal text-[#7B716D]">(선택, 최대 5장)</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {attachmentPreviews.map((preview, index) => (
              <div className="relative h-24 w-24 shrink-0" key={`${preview.name}-${index}`}>
                <img
                  alt={preview.name}
                  className="h-full w-full rounded-[12px] border border-[#E4DCD9] object-cover"
                  src={preview.url}
                />
                <button
                  aria-label="첨부 삭제"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#333333] shadow"
                  onClick={() => handleAttachmentDeleteRequest(index)}
                  type="button"
                >
                  <X aria-hidden className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {attachments.length < 5 ? (
              <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-[#BDB5B1] bg-white text-[14px] font-normal text-[#7B716D]">
                <ImagePlus aria-hidden className="mb-1 h-5 w-5" />
                + 사진
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
            ) : null}
          </div>
        </section>

        <section className="mb-3 rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[18px] font-normal text-[#111111]">
              <MessageCircle aria-hidden className="h-5 w-5 text-[#4F4542]" />
              한줄 코멘트
            </h2>
            <span className="text-[12px] font-normal text-[#7B716D]">(선택)</span>
          </div>
          <input
            className="h-10 w-full rounded-[12px] border border-[#D8D1CE] bg-white px-3 text-[15px] font-normal outline-none placeholder:text-[#9B9592]"
            maxLength={80}
            onChange={(event) => setOneLineComment(event.target.value)}
            placeholder="간단한 한줄 코멘트를 작성해주세요. ✨"
            value={oneLineComment}
          />
        </section>

        <section className="mb-3 rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <h2 className="mb-2 flex items-center gap-1.5 text-[18px] font-normal text-[#111111]">
            <Globe2 aria-hidden className="h-5 w-5 text-[#1676D2]" />
            공개 범위
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "전체 사원", value: "ALL" as BoardVisibility },
              { label: "우리 팀만", value: "TEAM" as BoardVisibility }
            ].map((option) => (
              <button
                className={`h-10 rounded-[12px] border text-[15px] font-normal ${
                  visibility === option.value
                    ? "border-[#7DB2F0] bg-[#EAF4FF] text-[#1171E8]"
                    : "border-[#D8D1CE] bg-white text-[#6F6662]"
                }`}
                key={option.value}
                onClick={() => setVisibility(option.value)}
                type="button"
              >
                {visibility === option.value ? "◉ " : "○ "}
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="h-12 rounded-[12px] border border-[#D8D1CE] bg-white text-[18px] font-normal text-[#4F4542]"
            onClick={() => router.push("/board")}
            type="button"
          >
            × 취소
          </button>
          <button
            className="h-12 rounded-[12px] border border-[#8FBDF0] bg-[#EAF4FF] text-[18px] font-normal text-[#1171E8] disabled:opacity-60"
            disabled={isSubmitting}
            onClick={() => void handleSubmit()}
            type="button"
          >
            ✓ 게시하기
          </button>
        </div>
      </div>

      {attachmentDeleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3F2C28]/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[320px] rounded-[16px] border border-[#D8D1CE] bg-white p-4 text-center shadow-[0_12px_28px_rgba(95,73,68,0.22)]">
            <h2 className="text-[18px] font-normal text-[#111111]">첨부 사진을 삭제할까요?</h2>
            <p className="mt-2 break-keep text-[13px] font-normal leading-5 text-[#7B716D]">
              {attachmentDeleteTarget.name} 파일이 작성 중인 게시글에서 삭제됩니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="h-10 rounded-[12px] border border-[#D8D1CE] bg-white text-[14px] font-normal text-[#4F4542]"
                onClick={() => setAttachmentDeleteTarget(null)}
                type="button"
              >
                취소
              </button>
              <button
                className="h-10 rounded-[12px] border border-[#E7B6BE] bg-[#FFF0F3] text-[14px] font-normal text-[#D83A42]"
                onClick={handleAttachmentDeleteConfirm}
                type="button"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function getCategoryClassName(category: BoardPostCategory) {
  const key = category.colorClassName as keyof typeof categoryStyles | null;

  if (key && categoryStyles[key]) {
    return categoryStyles[key];
  }

  return "border-[#D8D1CE] bg-[#F1ECE9] text-[#6F6662]";
}

function formatNow() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} (${weekday}) ${hour}:${minute}`;
}
