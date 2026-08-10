"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ClipboardList,
  Eye,
  Heart,
  Megaphone,
  MessageCircle,
  Pencil,
  Pin,
  Plus,
} from "lucide-react";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember,
} from "@/lib/auth-storage";
import {
  getBoardPosts,
  toggleBoardPostLike,
  type BoardPost,
  type BoardPostCategory,
} from "@/api/board";
import { ResponsiveContainer } from "@/components/layout/responsive-container";

type BoardTab = "NOTICE" | "EMPLOYEE";

const categoryStyles = {
  pink: {
    className: "bg-[#FFE4EC] text-[#EC4D7B]",
  },
  green: {
    className: "bg-[#DFF6E8] text-[#228C50]",
  },
  yellow: {
    className: "bg-[#FFF0C7] text-[#D28A00]",
  },
  blue: {
    className: "bg-[#DFF0FF] text-[#1676D2]",
  },
  orange: {
    className: "bg-[#FFE8C7] text-[#B76500]",
  },
  purple: {
    className: "bg-[#E9DDFF] text-[#7556D8]",
  },
} as const;

function getAuthorName(post: BoardPost) {
  return post.author.displayName ?? post.author.name;
}

function getCategoryClassName(category: BoardPostCategory | null) {
  const key = category?.colorClassName as
    | keyof typeof categoryStyles
    | undefined;

  if (key && categoryStyles[key]) {
    return categoryStyles[key].className;
  }

  return "bg-[#F1ECE9] text-[#6F6662]";
}

function formatBoardDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(
    date,
  );
  const period = date.getHours() < 12 ? "오전" : "오후";
  const hour = date.getHours() % 12 || 12;
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${weekday} ${period} ${String(hour).padStart(2, "0")}:${minute}`;
}

export default function BoardRoutePage() {
  const router = useRouter();
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<BoardTab>("EMPLOYEE");
  const [fullView, setFullView] = useState<BoardTab | null>(null);
  const [noticePosts, setNoticePosts] = useState<BoardPost[]>([]);
  const [employeePosts, setEmployeePosts] = useState<BoardPost[]>([]);
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const auth = getStoredAuth();

    if (!auth.accessToken || !auth.currentMember) {
      router.replace("/");
      return;
    }

    setCurrentMember(auth.currentMember);
    setAccessToken(auth.accessToken);
    setIsReady(true);

    async function loadBoardPosts() {
      try {
        setIsLoading(true);
        const [noticeResponse, employeeResponse] = await Promise.all([
          getBoardPosts(auth.accessToken, "NOTICE"),
          getBoardPosts(auth.accessToken, "EMPLOYEE"),
        ]);

        setNoticePosts(noticeResponse);
        setEmployeePosts(employeeResponse);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "게시판 데이터를 불러오지 못했습니다.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadBoardPosts();
  }, [router]);

  if (!isReady || !currentMember) {
    return null;
  }

  const backPath = isAdminRole(currentMember.roleType)
    ? "/admin-dashboard"
    : "/employee-dashboard";
  const visibleNoticePosts =
    fullView === "NOTICE" ? noticePosts : noticePosts.slice(0, 2);
  const visibleEmployeePosts =
    fullView === "EMPLOYEE" ? employeePosts : employeePosts.slice(0, 8);
  const shouldShowNoticeSection = fullView === null || fullView === "NOTICE";
  const shouldShowEmployeeSection =
    fullView === null || fullView === "EMPLOYEE";

  function handleViewChange(tab: BoardTab) {
    setActiveTab(tab);
    setFullView(tab);
  }

  function handleFullViewClick(tab: BoardTab) {
    setActiveTab(tab);
    setFullView((currentView) => (currentView === tab ? null : tab));
  }

  function handleBack() {
    router.push(backPath);
  }

  async function handleLikeClick(postId: number) {
    if (!accessToken) {
      return;
    }

    try {
      const response = await toggleBoardPostLike(accessToken, postId);
      const updatePost = (post: BoardPost) =>
        post.id === postId
          ? {
              ...post,
              likeCount: response.likeCount,
              likedByMe: response.likedByMe,
            }
          : post;

      setNoticePosts((posts) => posts.map(updatePost));
      setEmployeePosts((posts) => posts.map(updatePost));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "좋아요를 변경하지 못했습니다.",
      );
    }
  }

  return (
    <main className="login-pdf-font relative isolate min-h-dvh overflow-hidden bg-[linear-gradient(180deg,#eef5ff_0%,#f7f8fa_34%,#f7f8fa_100%)] px-4 py-6 text-[#191f28]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(49,130,246,0.24)_0%,rgba(49,130,246,0)_70%)] blur-sm"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-28 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(124,92,255,0.16)_0%,rgba(124,92,255,0)_72%)] blur-md"
      />
      <ResponsiveContainer
        className="relative z-10 space-y-4 pb-24"
        variant="board"
      >
        <header className="flex items-start gap-3 px-1">
          <button
            aria-label="뒤로가기"
            className="icon-button h-10 w-10 shrink-0 rounded-[13px]"
            onClick={handleBack}
            type="button"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>
          <div className="min-w-0 pt-0.5">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-[-0.04em] text-[#191f28]">
              <ClipboardList aria-hidden className="h-6 w-6 text-primary" />
              사내게시판
            </h1>
            <p className="mt-1 text-sm font-medium text-[#8b95a1]">
              공지와 동료들의 이야기를 한곳에서 확인하세요
            </p>
          </div>
        </header>

        <nav className="grid grid-cols-2 gap-1 rounded-[16px] bg-[linear-gradient(135deg,rgba(222,232,247,0.92),rgba(234,231,250,0.9))] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <button
            className={`flex h-10 items-center justify-center gap-1.5 rounded-[12px] text-sm font-bold transition ${
              activeTab === "NOTICE"
                ? "bg-[linear-gradient(135deg,#ffffff,#f2f7ff)] text-primary shadow-[0_2px_8px_rgba(49,130,246,0.12)]"
                : "text-[#6b7684]"
            }`}
            onClick={() => handleViewChange("NOTICE")}
            type="button"
          >
            <Megaphone aria-hidden className="h-4 w-4" />
            공지사항
          </button>
          <button
            className={`flex h-10 items-center justify-center gap-1.5 rounded-[12px] text-sm font-bold transition ${
              activeTab === "EMPLOYEE"
                ? "bg-[linear-gradient(135deg,#ffffff,#f2f7ff)] text-primary shadow-[0_2px_8px_rgba(49,130,246,0.12)]"
                : "text-[#6b7684]"
            }`}
            onClick={() => handleViewChange("EMPLOYEE")}
            type="button"
          >
            <Pencil aria-hidden className="h-4 w-4" />
            사원게시물
          </button>
        </nav>

        {message ? (
          <div className="rounded-[14px] bg-[#fff0f1] px-4 py-3 text-center text-sm font-semibold text-[#e42939]">
            {message}
          </div>
        ) : null}

        {shouldShowNoticeSection ? (
          <section className="surface-card bg-[linear-gradient(145deg,#ffffff_0%,#f7faff_100%)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#191f28]">
                <Megaphone aria-hidden className="h-5 w-5 text-primary" />
                공지사항
              </h2>
              <button
                className="h-8 rounded-[10px] bg-[#f2f4f6] px-3 text-xs font-semibold text-[#4e5968] transition hover:bg-[#e5e8eb]"
                onClick={() => handleFullViewClick("NOTICE")}
                type="button"
              >
                {fullView === "NOTICE" ? "접기" : "전체보기"}
              </button>
            </div>

            <div
              className={`${fullView === "NOTICE" ? "max-h-[640px] overflow-y-auto pr-1" : ""} divide-y divide-[#e5e8eb]`}
            >
              {isLoading && visibleNoticePosts.length === 0 ? (
                <p className="rounded-[14px] bg-[#f7f8fa] py-6 text-center text-sm font-medium text-[#8b95a1]">
                  공지사항을 불러오는 중입니다.
                </p>
              ) : null}
              {!isLoading && visibleNoticePosts.length === 0 ? (
                <p className="rounded-[14px] bg-[#f7f8fa] py-6 text-center text-sm font-medium text-[#8b95a1]">
                  등록된 공지사항이 없습니다.
                </p>
              ) : null}
              {visibleNoticePosts.map((post, index) => (
                <button
                  className="grid w-full grid-cols-[36px_1fr] gap-2 py-2 text-left first:pt-0 last:pb-0"
                  key={post.id}
                  onClick={() => router.push(`/board/${post.id}`)}
                  type="button"
                >
                  <div className="mt-0.5 flex w-7 justify-center">
                    {post.isPinned || index === 0 ? (
                      <Pin
                        aria-hidden
                        className="h-5 w-5 rotate-[-20deg] text-[#F04D6E]"
                      />
                    ) : (
                      <span className="h-12 w-[3px] rounded-full bg-[#d6e8ff]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-[#edf6ff] px-2 py-1 text-[10px] font-bold leading-none text-primary">
                        공지
                      </span>
                      <h3 className="truncate text-[15px] font-semibold text-[#191f28]">
                        {post.title}
                      </h3>
                    </div>
                    <p className="mt-1 truncate text-[12px] font-normal text-[#7B716D]">
                      <span className="text-[#1171E8]">
                        {getAuthorName(post)} {post.author.positionName ?? ""}
                      </span>
                      <span className="px-1.5">·</span>
                      {formatBoardDate(post.createdAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {shouldShowEmployeeSection ? (
          <section className="surface-card bg-[linear-gradient(145deg,#ffffff_0%,#faf8ff_100%)] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#191f28]">
                <Pencil aria-hidden className="h-5 w-5 text-primary" />
                사원게시물
              </h2>
              <button
                className="h-8 rounded-[10px] bg-[#f2f4f6] px-3 text-xs font-semibold text-[#4e5968] transition hover:bg-[#e5e8eb]"
                onClick={() => handleFullViewClick("EMPLOYEE")}
                type="button"
              >
                {fullView === "EMPLOYEE" ? "접기" : "전체보기"}
              </button>
            </div>

            <div className="max-h-[640px] divide-y divide-[#e5e8eb] overflow-y-auto pr-1">
              {isLoading && employeePosts.length === 0 ? (
                <p className="rounded-[14px] bg-[#f7f8fa] py-8 text-center text-sm font-medium text-[#8b95a1]">
                  사원게시물을 불러오는 중입니다.
                </p>
              ) : null}
              {!isLoading && employeePosts.length === 0 ? (
                <p className="rounded-[14px] bg-[#f7f8fa] py-8 text-center text-sm font-medium text-[#8b95a1]">
                  등록된 사원게시물이 없습니다.
                </p>
              ) : null}
              {visibleEmployeePosts.map((post) => {
                const category = post.categories[0] ?? null;
                const categoryClassName = getCategoryClassName(category);

                return (
                  <article
                    className="w-full py-3 text-left first:pt-1 last:pb-1"
                    key={post.id}
                    onClick={() => router.push(`/board/${post.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        router.push(`/board/${post.id}`);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="min-w-0">
                      <div className="min-w-0 sm:flex sm:items-center sm:gap-2">
                        <p className="truncate text-[12px] font-normal text-[#7B716D]">
                          <span className="text-[14px] font-semibold text-primary">
                            {getAuthorName(post)}{" "}
                            {post.author.positionName ?? ""}
                          </span>
                          <span className="px-1.5">·</span>
                          {post.author.organizationName ?? "소속 미정"}
                          <span className="px-1.5">·</span>
                          {formatBoardDate(post.createdAt)}
                        </p>
                        {category ? (
                          <div
                            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-normal sm:mt-0 sm:shrink-0 ${categoryClassName}`}
                          >
                            <span aria-hidden>{category.icon}</span>
                            {category.name}
                          </div>
                        ) : null}
                      </div>
                      <h3 className="mt-1 truncate text-[15px] font-semibold text-[#191f28]">
                        {post.title}
                      </h3>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="min-w-0 truncate text-[12px] font-normal text-[#7B716D]">
                          <MessageCircle
                            aria-hidden
                            className="mr-1 inline h-3.5 w-3.5 text-[#4F4542]"
                          />
                          {post.oneLineComment ?? post.content}
                        </p>
                        <div className="flex shrink-0 items-center gap-2 text-[12px] font-normal text-[#6F6662]">
                          <button
                            className="inline-flex items-center gap-0.5"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleLikeClick(post.id);
                            }}
                            type="button"
                          >
                            <Heart
                              aria-hidden
                              className={`h-3.5 w-3.5 text-[#f04452] ${post.likedByMe ? "fill-[#f04452]" : "fill-none"}`}
                            />
                            {post.likeCount}
                          </button>
                          <span className="inline-flex items-center gap-0.5">
                            <MessageCircle
                              aria-hidden
                              className="h-3.5 w-3.5 text-[#222222]"
                            />
                            {post.commentCount}
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <Eye
                              aria-hidden
                              className="h-3.5 w-3.5 text-[#222222]"
                            />
                            {post.viewCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </ResponsiveContainer>

      <button
        aria-label="게시글 작성"
        className="fixed bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#3182f6_0%,#6b5cff_100%)] text-white shadow-[0_10px_24px_rgba(49,130,246,0.32)] transition hover:brightness-95 active:scale-95"
        onClick={() => router.push("/board/new")}
        style={{
          right:
            "max(1.25rem, calc((100vw - min(calc(100vw - 2rem), 24rem)) / 2 + 0.75rem))",
        }}
        type="button"
      >
        <Plus aria-hidden className="h-8 w-8" />
      </button>
    </main>
  );
}
