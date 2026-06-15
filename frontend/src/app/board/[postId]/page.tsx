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
  getBoardPostDetail,
  toggleBoardPostLike,
  type BoardPostCategory,
  type BoardPostDetail
} from "@/api/board";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";

const categoryStyles = {
  pink: "bg-[#FFE4EC] text-[#EC4D7B]",
  green: "bg-[#DFF6E8] text-[#228C50]",
  yellow: "bg-[#FFF0C7] text-[#D28A00]",
  blue: "bg-[#DFF0FF] text-[#1676D2]",
  orange: "bg-[#FFE8C7] text-[#B76500]",
  purple: "bg-[#E9DDFF] text-[#7556D8]"
} as const;

export default function BoardPostDetailPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postIdParam = params?.postId;
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [post, setPost] = useState<BoardPostDetail | null>(null);
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

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="mx-auto w-full max-w-[380px] pb-8">
        <header className="relative mb-3 pt-1 text-center">
          <button
            className="absolute left-0 top-0 flex min-h-0 items-center rounded-[10px] border border-[#D8D1CE] bg-white px-2.5 py-0 text-[12px] font-normal leading-6 text-[#333333] shadow-sm"
            onClick={() => router.push(backPath)}
            type="button"
          >
            ← 뒤로가기
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

              <h2 className="break-keep text-[21px] font-normal leading-7 text-[#111111]">{post.title}</h2>

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
              <p className="whitespace-pre-wrap break-keep text-[14px] font-normal leading-6 text-[#333333]">
                {post.content}
              </p>
              <div className="mt-3 rounded-[12px] bg-[#F7F7F7] px-3 py-2 text-[12px] font-normal text-[#6F6662]">
                <MessageCircle aria-hidden className="mr-1 inline h-3.5 w-3.5 text-[#4F4542]" />
                {post.oneLineComment ?? "한줄 코멘트가 없습니다."}
              </div>
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
                      <p className="whitespace-pre-wrap break-keep text-[13px] font-normal leading-5 text-[#333333]">{comment.content}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-[12px] bg-[#F7F7F7] px-3 py-3 text-center text-[12px] font-normal text-[#7B716D]">
                  아직 댓글이 없습니다.
                </p>
              )}
            </section>
          </div>
        ) : null}
      </div>
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
