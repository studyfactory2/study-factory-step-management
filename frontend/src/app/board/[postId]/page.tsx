"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Eye,
  Heart,
  MessageCircle,
  Pencil,
  Pin,
  Tag
} from "lucide-react";
import {
  createBoardComment,
  deleteBoardComment,
  deleteBoardPost,
  getBoardPostDetail,
  toggleBoardPostLike,
  updateBoardComment,
  updateBoardPost,
  type BoardPostCategory,
  type BoardPostDetail
} from "@/api/board";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";
import { ResponsiveContainer } from "@/components/layout/responsive-container";

const categoryStyles = {
  pink: "bg-[#FFE4EC] text-[#EC4D7B]",
  green: "bg-[#DFF6E8] text-[#228C50]",
  yellow: "bg-[#FFF0C7] text-[#D28A00]",
  blue: "bg-[#DFF0FF] text-[#1676D2]",
  orange: "bg-[#FFE8C7] text-[#B76500]",
  purple: "bg-[#E9DDFF] text-[#7556D8]"
} as const;

type DeleteTarget =
  | {
      type: "post";
    }
  | {
      commentId: number;
      type: "comment";
    };

export default function BoardPostDetailPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postIdParam = params?.postId;
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [post, setPost] = useState<BoardPostDetail | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editOneLineComment, setEditOneLineComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [isPostSubmitting, setIsPostSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const auth = getStoredAuth();
    const postId = Number(postIdParam);

    if (!auth.accessToken || !auth.currentMember) {
      router.replace("/");
      return;
    }

    if (!postId) {
      router.replace("/board");
      return;
    }

    setCurrentMember(auth.currentMember);
    setAccessToken(auth.accessToken);

    async function loadDetail() {
      try {
        setIsLoading(true);
        setPost(await getBoardPostDetail(auth.accessToken, postId));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "게시글 상세를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadDetail();
  }, [postIdParam, router]);

  if (!currentMember) {
    return null;
  }

  const backPath = "/board";
  const dashboardPath = isAdminRole(currentMember.roleType) ? "/admin-dashboard" : "/employee-dashboard";
  const canManageAllBoardContent = isAdminRole(currentMember.roleType);
  const isOwnPost = post?.author.id === currentMember.id;
  const canDeletePost = Boolean(isOwnPost || canManageAllBoardContent);

  async function handleLikeClick() {
    if (!accessToken || !post) {
      return;
    }

    try {
      const response = await toggleBoardPostLike(accessToken, post.id);
      setPost({
        ...post,
        likeCount: response.likeCount,
        likedByMe: response.likedByMe
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "좋아요를 변경하지 못했습니다.");
    }
  }

  async function handleCommentSubmit() {
    if (!accessToken || !post || isCommentSubmitting) {
      return;
    }

    const trimmedContent = commentContent.trim();

    if (!trimmedContent) {
      setMessage("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setMessage("");
      setIsCommentSubmitting(true);
      const createdComment = await createBoardComment(accessToken, post.id, {
        content: trimmedContent
      });

      setPost({
        ...post,
        comments: [...post.comments, createdComment],
        commentCount: post.commentCount + 1
      });
      setCommentContent("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "댓글을 등록하지 못했습니다.");
    } finally {
      setIsCommentSubmitting(false);
    }
  }

  function handleEditClick() {
    if (!post) {
      return;
    }

    setEditTitle(post.title);
    setEditContent(post.content);
    setEditOneLineComment(post.oneLineComment ?? "");
    setIsEditing(true);
    setMessage("");
  }

  async function handlePostUpdateSubmit() {
    if (!accessToken || !post || isPostSubmitting) {
      return;
    }

    if (!editTitle.trim()) {
      setMessage("제목을 입력해주세요.");
      return;
    }

    if (!editContent.trim()) {
      setMessage("본문 내용을 입력해주세요.");
      return;
    }

    try {
      setMessage("");
      setIsPostSubmitting(true);
      const updatedPost = await updateBoardPost(accessToken, post.id, {
        content: editContent.trim(),
        oneLineComment: editOneLineComment.trim() || undefined,
        title: editTitle.trim(),
        visibility: post.visibility
      });

      setPost(updatedPost);
      setIsEditing(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "게시글을 수정하지 못했습니다.");
    } finally {
      setIsPostSubmitting(false);
    }
  }

  async function handlePostDeleteConfirm() {
    if (!accessToken || !post || isPostSubmitting) {
      return;
    }

    try {
      setMessage("");
      setIsPostSubmitting(true);
      await deleteBoardPost(accessToken, post.id);
      router.push(backPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "게시글을 삭제하지 못했습니다.");
      setIsPostSubmitting(false);
    }
  }

  function handleCommentEditClick(commentId: number, content: string) {
    setEditingCommentId(commentId);
    setEditCommentContent(content);
    setMessage("");
  }

  async function handleCommentUpdateSubmit(commentId: number) {
    if (!accessToken || !post || isCommentSubmitting) {
      return;
    }

    const trimmedContent = editCommentContent.trim();

    if (!trimmedContent) {
      setMessage("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setMessage("");
      setIsCommentSubmitting(true);
      const updatedComment = await updateBoardComment(accessToken, post.id, commentId, {
        content: trimmedContent
      });

      setPost({
        ...post,
        comments: post.comments.map((comment) => (comment.id === commentId ? updatedComment : comment))
      });
      setEditingCommentId(null);
      setEditCommentContent("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "댓글을 수정하지 못했습니다.");
    } finally {
      setIsCommentSubmitting(false);
    }
  }

  async function handleCommentDeleteConfirm(commentId: number) {
    if (!accessToken || !post || isCommentSubmitting) {
      return;
    }

    try {
      setMessage("");
      setIsCommentSubmitting(true);
      await deleteBoardComment(accessToken, post.id, commentId);
      setPost({
        ...post,
        comments: post.comments.filter((comment) => comment.id !== commentId),
        commentCount: Math.max(0, post.commentCount - 1)
      });
      setDeleteTarget(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "댓글을 삭제하지 못했습니다.");
    } finally {
      setIsCommentSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    if (deleteTarget.type === "post") {
      await handlePostDeleteConfirm();
      return;
    }

    await handleCommentDeleteConfirm(deleteTarget.commentId);
  }

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <ResponsiveContainer className="pb-8" variant="board">
        <header className="relative mb-3 pt-1 text-center">
          <button
            className="absolute left-0 top-0 flex min-h-0 items-center rounded-[10px] border border-[#D8D1CE] bg-white px-2.5 py-0 text-[12px] font-bold leading-6 text-[#333333] shadow-sm"
            onClick={() => router.push(backPath)}
            type="button"
          >
            ←
          </button>
          <h1 className="flex items-center justify-center gap-1.5 text-[22px] font-normal leading-tight text-[#111111]">
            {post?.postType === "NOTICE" ? (
              <Pin aria-hidden className="h-6 w-6 -translate-y-0.5 rotate-[-18deg] text-[#F04D6E]" />
            ) : (
              <Pencil aria-hidden className="h-6 w-6 -translate-y-0.5 text-[#E3A12A]" />
            )}
          </h1>
          <button
            className="absolute right-0 top-0 flex min-h-0 items-center rounded-[10px] border border-[#D8D1CE] bg-white px-2.5 py-0 text-[12px] font-normal leading-6 text-[#333333] shadow-sm"
            onClick={() => router.push(dashboardPath)}
            type="button"
          >
            홈
          </button>
        </header>

        {message ? (
          <div className="mb-3 rounded-[12px] border border-[#D8D1CE] bg-white px-3 py-2 text-center text-[12px] font-normal text-[#7B716D]">
            {message}
          </div>
        ) : null}

        {isLoading ? (
          <section className="rounded-[14px] border border-[#D8D1CE] bg-white p-5 text-center text-[13px] font-normal text-[#7B716D] shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
            게시글을 불러오는 중입니다.
          </section>
        ) : null}

        {!isLoading && post ? (
          <div className="space-y-3">
            <section className="rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[12px] font-normal ${post.postType === "NOTICE" ? "bg-[#FFE4EC] text-[#E93566]" : "bg-[#DFF0FF] text-[#1171E8]"}`}>
                  {post.postType === "NOTICE" ? "공지사항" : "사원게시물"}
                </span>
                <span className="text-[11px] font-normal text-[#7B716D]">{formatBoardDate(post.createdAt)}</span>
              </div>

              <div className="flex items-start justify-between gap-2">
                {isEditing ? (
                  <input
                    className="h-10 min-w-0 flex-1 rounded-[12px] border border-[#D8D1CE] bg-white px-3 text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#9B9592]"
                    maxLength={40}
                    onChange={(event) => setEditTitle(event.target.value)}
                    value={editTitle}
                  />
                ) : (
                  <h2 className="min-w-0 flex-1 break-keep text-[21px] font-normal leading-7 text-[#111111]">{post.title}</h2>
                )}

                {isOwnPost || canDeletePost ? (
                  <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                    {isEditing ? (
                      <>
                        <button
                          className="rounded-[10px] border border-[#D8D1CE] bg-white px-2.5 py-0.5 text-[12px] font-normal text-[#333333] shadow-sm disabled:opacity-50"
                          disabled={isPostSubmitting}
                          onClick={() => setIsEditing(false)}
                          type="button"
                        >
                          취소
                        </button>
                        <button
                          className="rounded-[10px] border border-[#B8CDD9] bg-[#EAF7FF] px-2.5 py-0.5 text-[12px] font-normal text-[#2D70CB] disabled:opacity-50"
                          disabled={isPostSubmitting}
                          onClick={() => void handlePostUpdateSubmit()}
                          type="button"
                        >
                          저장
                        </button>
                      </>
                    ) : (
                      <>
                        {isOwnPost ? (
                          <button
                            className="rounded-[10px] border border-[#D8D1CE] bg-white px-2.5 py-0.5 text-[12px] font-normal text-[#333333] shadow-sm disabled:opacity-50"
                            disabled={isPostSubmitting}
                            onClick={handleEditClick}
                            type="button"
                          >
                            수정
                          </button>
                        ) : null}
                        {canDeletePost ? (
                          <button
                            className="rounded-[10px] border border-[#E7C7C7] bg-white px-2.5 py-0.5 text-[12px] font-normal text-[#B94C4C] shadow-sm disabled:opacity-50"
                            disabled={isPostSubmitting}
                            onClick={() => setDeleteTarget({ type: "post" })}
                            type="button"
                          >
                            삭제
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="mt-2 flex items-center gap-2 text-[12px] font-normal text-[#7B716D]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DFF0FF] text-[17px] text-[#1171E8]">
                  {getAuthorName(post).slice(0, 1)}
                </span>
                <p className="min-w-0">
                  <span className="text-[14px] text-[#1171E8]">{getAuthorName(post)} {post.author.positionName ?? ""}</span>
                  <br />
                  <span>{post.author.organizationName ?? "소속 미정"}</span>
                </p>
              </div>

              {post.categories.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.categories.map((category) => (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-normal ${getCategoryClassName(category)}`}
                      key={category.id}
                    >
                      <span aria-hidden>{category.icon}</span>
                      {category.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
              {isEditing ? (
                <>
                  <textarea
                    className="min-h-[150px] w-full resize-none rounded-[12px] border border-[#D8D1CE] bg-white px-3 py-2 text-[14px] font-normal leading-6 text-[#333333] outline-none placeholder:text-[#9B9592]"
                    maxLength={500}
                    onChange={(event) => setEditContent(event.target.value)}
                    value={editContent}
                  />
                  <div className="mt-3 flex items-center rounded-[12px] border border-[#D8D1CE] bg-white px-3 py-2">
                    <MessageCircle aria-hidden className="mr-1 h-3.5 w-3.5 shrink-0 text-[#4F4542]" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[12px] font-normal text-[#6F6662] outline-none placeholder:text-[#9B9592]"
                      maxLength={80}
                      onChange={(event) => setEditOneLineComment(event.target.value)}
                      placeholder="간단한 한줄 코멘트를 작성해주세요."
                      value={editOneLineComment}
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="whitespace-pre-wrap break-keep text-[14px] font-normal leading-6 text-[#333333]">
                    {post.content}
                  </p>
                  <div className="mt-3 rounded-[12px] bg-[#F7F7F7] px-3 py-2 text-[12px] font-normal text-[#6F6662]">
                    <MessageCircle aria-hidden className="mr-1 inline h-3.5 w-3.5 text-[#4F4542]" />
                    {post.oneLineComment ?? "한줄 코멘트가 없습니다."}
                  </div>
                </>
              )}
            </section>

            {post.attachments.length ? (
              <section className="rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
                <h3 className="mb-2 flex items-center gap-1.5 text-[16px] font-normal text-[#111111]">
                  <Tag aria-hidden className="h-4 w-4 text-[#4F4542]" />
                  첨부 사진
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {post.attachments.map((attachment) => (
                    <img
                      alt={attachment.originalName ?? "게시글 첨부 이미지"}
                      className="aspect-square rounded-[12px] border border-[#E4DCD9] object-cover"
                      key={attachment.id}
                      src={attachment.imageUrl}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
              <div className="mb-3 flex items-center justify-around rounded-[12px] bg-[#F9F7F5] px-2 py-2 text-[13px] font-normal text-[#6F6662]">
                <button
                  className="inline-flex items-center gap-1"
                  onClick={() => void handleLikeClick()}
                  type="button"
                >
                  <Heart
                    aria-hidden
                    className={`h-4 w-4 text-[#FF5A88] ${post.likedByMe ? "fill-[#FF5A88]" : "fill-none"}`}
                  />
                  {post.likeCount}
                </button>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle aria-hidden className="h-4 w-4 text-[#222222]" />
                  {post.commentCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye aria-hidden className="h-4 w-4 text-[#222222]" />
                  {post.viewCount}
                </span>
              </div>

              <h3 className="mb-2 text-[16px] font-normal text-[#111111]">댓글</h3>
              {post.comments.length ? (
                <div className="space-y-2">
                  {post.comments.map((comment) => (
                    <article className="rounded-[12px] bg-[#F7F7F7] px-3 py-2" key={comment.id}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-normal text-[#7B716D]">
                        <span className="text-[#1171E8]">{comment.author.displayName ?? comment.author.name}</span>
                        <span>{formatBoardDate(comment.createdAt)}</span>
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <input
                            className="h-9 w-full rounded-[10px] border border-[#D8D1CE] bg-white px-3 text-[13px] font-normal text-[#333333] outline-none placeholder:text-[#9B9592]"
                            maxLength={500}
                            onChange={(event) => setEditCommentContent(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                                event.preventDefault();
                                void handleCommentUpdateSubmit(comment.id);
                              }
                            }}
                            value={editCommentContent}
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              className="rounded-[10px] border border-[#D8D1CE] bg-white px-2.5 py-0.5 text-[12px] font-normal text-[#333333] shadow-sm disabled:opacity-50"
                              disabled={isCommentSubmitting}
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditCommentContent("");
                              }}
                              type="button"
                            >
                              취소
                            </button>
                            <button
                              className="rounded-[10px] border border-[#B8CDD9] bg-white px-2.5 py-0.5 text-[12px] font-normal text-[#2D70CB] shadow-sm disabled:opacity-50"
                              disabled={isCommentSubmitting}
                              onClick={() => void handleCommentUpdateSubmit(comment.id)}
                              type="button"
                            >
                              저장
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap break-keep text-[13px] font-normal leading-5 text-[#333333]">{comment.content}</p>
                          {comment.author.id === currentMember.id || canManageAllBoardContent ? (
                            <div className="mt-2 flex justify-end gap-1.5">
                              {comment.author.id === currentMember.id ? (
                                <button
                                  className="rounded-[10px] border border-[#D8D1CE] bg-white px-2.5 py-0.5 text-[12px] font-normal text-[#333333] shadow-sm disabled:opacity-50"
                                  disabled={isCommentSubmitting}
                                  onClick={() => handleCommentEditClick(comment.id, comment.content)}
                                  type="button"
                                >
                                  수정
                                </button>
                              ) : null}
                              <button
                                className="rounded-[10px] border border-[#E7C7C7] bg-white px-2.5 py-0.5 text-[12px] font-normal text-[#B94C4C] shadow-sm disabled:opacity-50"
                                disabled={isCommentSubmitting}
                                onClick={() => setDeleteTarget({ commentId: comment.id, type: "comment" })}
                                type="button"
                              >
                                삭제
                              </button>
                            </div>
                          ) : null}
                        </>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-[12px] bg-[#F7F7F7] px-3 py-3 text-center text-[12px] font-normal text-[#7B716D]">
                  아직 댓글이 없습니다.
                </p>
              )}

              <div className="mt-3 flex items-center gap-2">
                <input
                  className="h-10 min-w-0 flex-1 rounded-[12px] border border-[#D8D1CE] bg-white px-3 text-[13px] font-normal text-[#111111] outline-none placeholder:text-[#9B9592]"
                  maxLength={500}
                  onChange={(event) => setCommentContent(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      void handleCommentSubmit();
                    }
                  }}
                  placeholder="댓글을 입력해주세요."
                  value={commentContent}
                />
                <button
                  className="h-10 shrink-0 rounded-[12px] border border-[#D8D1CE] bg-white px-3 text-[13px] font-normal text-[#333333] shadow-sm disabled:opacity-50"
                  disabled={isCommentSubmitting}
                  onClick={() => void handleCommentSubmit()}
                  type="button"
                >
                  등록
                </button>
              </div>
            </section>
          </div>
        ) : null}
      </ResponsiveContainer>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4">
          <section className="w-full max-w-[320px] rounded-[16px] border border-[#D8D1CE] bg-white p-4 text-center shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
            <h2 className="text-[18px] font-normal text-[#111111]">
              {deleteTarget.type === "post" ? "게시글을 삭제할까요?" : "댓글을 삭제할까요?"}
            </h2>
            <p className="mt-2 text-[13px] font-normal leading-5 text-[#6F6662]">
              삭제하면 목록에서 더 이상 보이지 않습니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="h-10 rounded-[12px] border border-[#D8D1CE] bg-white text-[13px] font-normal text-[#333333] shadow-sm"
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                취소
              </button>
              <button
                className="h-10 rounded-[12px] border border-[#E7C7C7] bg-white text-[13px] font-normal text-[#B94C4C] shadow-sm disabled:opacity-50"
                disabled={isPostSubmitting || isCommentSubmitting}
                onClick={() => void handleDeleteConfirm()}
                type="button"
              >
                삭제
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function getAuthorName(post: BoardPostDetail) {
  return post.author.displayName ?? post.author.name;
}

function getCategoryClassName(category: BoardPostCategory) {
  const key = category.colorClassName as keyof typeof categoryStyles | null;

  if (key && categoryStyles[key]) {
    return categoryStyles[key];
  }

  return "bg-[#F1ECE9] text-[#6F6662]";
}

function formatBoardDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date);
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${month}.${day}(${weekday}) ${hour}:${minute}`;
}
