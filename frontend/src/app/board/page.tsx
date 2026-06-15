"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Eye,
  Heart,
  Megaphone,
  MessageCircle,
  Pencil,
  Pin,
  Plus
} from "lucide-react";
import {
  getStoredAuth,
  isAdminRole,
  type StoredMember
} from "@/lib/auth-storage";
import { getBoardPosts, toggleBoardPostLike, type BoardPost, type BoardPostCategory } from "@/api/board";

type BoardTab = "NOTICE" | "EMPLOYEE";

const categoryStyles = {
  pink: {
    className: "bg-[#FFE4EC] text-[#EC4D7B]"
  },
  green: {
    className: "bg-[#DFF6E8] text-[#228C50]"
  },
  yellow: {
    className: "bg-[#FFF0C7] text-[#D28A00]"
  },
  blue: {
    className: "bg-[#DFF0FF] text-[#1676D2]"
  },
  orange: {
    className: "bg-[#FFE8C7] text-[#B76500]"
  },
  purple: {
    className: "bg-[#E9DDFF] text-[#7556D8]"
  }
} as const;

const avatarClassNames = [
  "bg-[#FFD9E6] text-[#D82459]",
  "bg-[#CFEFFF] text-[#1373C8]",
  "bg-[#FFE7B8] text-[#C56A00]",
  "bg-[#CFF7DF] text-[#168B4E]",
  "bg-[#E6D8FF] text-[#7556D8]",
  "bg-[#D8F0FF] text-[#0E6DC4]"
];

function getAuthorName(post: BoardPost) {
  return post.author.displayName ?? post.author.name;
}

function getAvatarClassName(authorId: number) {
  return avatarClassNames[authorId % avatarClassNames.length];
}

function getCategoryClassName(category: BoardPostCategory | null) {
  const key = category?.colorClassName as keyof typeof categoryStyles | undefined;

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

  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(date);
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
          getBoardPosts(auth.accessToken, "EMPLOYEE")
        ]);

        setNoticePosts(noticeResponse);
        setEmployeePosts(employeeResponse);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "게시판 데이터를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadBoardPosts();
  }, [router]);

  if (!isReady || !currentMember) {
    return null;
  }

  const backPath = isAdminRole(currentMember.roleType) ? "/admin-dashboard" : "/employee-dashboard";
  const visibleNoticePosts = noticePosts.slice(0, 2);

  async function handleLikeClick(postId: number) {
    if (!accessToken) {
      return;
    }

    try {
      const response = await toggleBoardPostLike(accessToken, postId);
      const updatePost = (post: BoardPost) => (
        post.id === postId
          ? {
              ...post,
              likeCount: response.likeCount,
              likedByMe: response.likedByMe
            }
          : post
      );

      setNoticePosts((posts) => posts.map(updatePost));
      setEmployeePosts((posts) => posts.map(updatePost));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "좋아요를 변경하지 못했습니다.");
    }
  }

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="mx-auto w-full max-w-[380px] pb-20">
        <header className="relative mb-3 pt-1 text-center">
          <button
            className="absolute left-0 top-0 flex min-h-0 items-center rounded-[10px] border border-[#D8D1CE] bg-white px-2.5 py-0 text-[12px] font-normal leading-6 text-[#333333] shadow-sm"
            onClick={() => router.push(backPath)}
            type="button"
          >
            ← 뒤로가기
          </button>
          <h1 className="flex items-center justify-center gap-1.5 text-[24px] font-normal leading-tight text-[#111111]">
            <ClipboardList aria-hidden className="h-7 w-7 -translate-y-0.5 text-[#D48B26]" />
            사내게시판
          </h1>
          <p className="mt-0.5 text-[15px] font-normal text-[#77716E]">함께 만드는 우리 회사 💕</p>
        </header>

        <nav className="mb-4 grid grid-cols-2 gap-7 px-7">
          <button
            className={`flex h-11 items-center justify-center gap-2 border-b-[3px] text-[18px] font-normal ${
              activeTab === "NOTICE"
                ? "border-[#FF5A88] text-[#E93566]"
                : "border-transparent text-[#8A817E]"
            }`}
            onClick={() => setActiveTab("NOTICE")}
            type="button"
          >
            <Megaphone aria-hidden className="h-5 w-6 scale-y-125" />
            공지사항
          </button>
          <button
            className={`flex h-11 items-center justify-center gap-2 border-b-[3px] text-[18px] font-normal ${
              activeTab === "EMPLOYEE"
                ? "border-[#2D7FEA] text-[#1171E8]"
                : "border-transparent text-[#8A817E]"
            }`}
            onClick={() => setActiveTab("EMPLOYEE")}
            type="button"
          >
            <Pencil aria-hidden className="h-5 w-5" />
            사원게시물
          </button>
        </nav>

        {message ? (
          <div className="mb-3 rounded-[12px] border border-[#D8D1CE] bg-white px-3 py-2 text-center text-[12px] font-normal text-[#7B716D]">
            {message}
          </div>
        ) : null}

        <section className="mb-4 rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[21px] font-normal text-[#111111]">
              <Megaphone aria-hidden className="h-6 w-7 scale-y-125 text-[#F04D6E]" />
              공지사항
            </h2>
            <button
              className="h-7 rounded-[9px] border border-[#D8D1CE] bg-white px-2.5 text-[12px] font-normal text-[#222222]"
              type="button"
            >
              전체보기
            </button>
          </div>

          <div className="divide-y divide-[#ECE7E4]">
            {isLoading && visibleNoticePosts.length === 0 ? (
              <p className="py-3 text-center text-[12px] font-normal text-[#7B716D]">공지사항을 불러오는 중입니다.</p>
            ) : null}
            {!isLoading && visibleNoticePosts.length === 0 ? (
              <p className="py-3 text-center text-[12px] font-normal text-[#7B716D]">등록된 공지사항이 없습니다.</p>
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
                    <Pin aria-hidden className="h-5 w-5 rotate-[-20deg] text-[#F04D6E]" />
                  ) : (
                    <span className="h-14 w-[3px] rounded-full bg-[#FF6A95]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-[#FFE4EC] px-2 py-0.5 text-[12px] font-normal leading-none text-[#E93566]">
                      공지
                    </span>
                    <h3 className="truncate text-[15px] font-normal text-[#111111]">{post.title}</h3>
                  </div>
                  <p className="mt-1 truncate text-[12px] font-normal text-[#7B716D]">
                    <span className="text-[#1171E8]">{getAuthorName(post)} {post.author.positionName ?? ""}</span>
                    <span className="px-1.5">·</span>
                    {formatBoardDate(post.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[14px] border border-[#D8D1CE] bg-white p-3 shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[21px] font-normal text-[#111111]">
              <Pencil aria-hidden className="h-6 w-6 text-[#E3A12A]" />
              사원게시물
            </h2>
            <button
              className="h-7 rounded-[9px] border border-[#D8D1CE] bg-white px-2.5 text-[12px] font-normal text-[#222222]"
              type="button"
            >
              전체보기
            </button>
          </div>

          <div className="max-h-[640px] divide-y divide-[#ECE7E4] overflow-y-auto pr-1">
            {isLoading && employeePosts.length === 0 ? (
              <p className="py-8 text-center text-[12px] font-normal text-[#7B716D]">사원게시물을 불러오는 중입니다.</p>
            ) : null}
            {!isLoading && employeePosts.length === 0 ? (
              <p className="py-8 text-center text-[12px] font-normal text-[#7B716D]">등록된 사원게시물이 없습니다.</p>
            ) : null}
            {employeePosts.map((post) => {
              const category = post.categories[0] ?? null;
              const categoryClassName = getCategoryClassName(category);

              return (
                <article
                  className="grid w-full grid-cols-[42px_1fr] gap-2 py-3 text-left first:pt-1 last:pb-1"
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
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-[19px] font-normal ${getAvatarClassName(post.author.id)}`}>
                    {getAuthorName(post).slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-normal text-[#7B716D]">
                      <span className="text-[14px] text-[#1171E8]">{getAuthorName(post)} {post.author.positionName ?? ""}</span>
                      <span className="px-1.5">·</span>
                      {post.author.organizationName ?? "소속 미정"}
                      <span className="px-1.5">·</span>
                      {formatBoardDate(post.createdAt)}
                    </p>
                    {category ? (
                      <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-normal ${categoryClassName}`}>
                        <span aria-hidden>{category.icon}</span>
                        {category.name}
                      </div>
                    ) : null}
                    <h3 className="mt-1 truncate text-[15px] font-normal text-[#111111]">{post.title}</h3>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-[12px] font-normal text-[#7B716D]">
                        <MessageCircle aria-hidden className="mr-1 inline h-3.5 w-3.5 text-[#4F4542]" />
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
                            className={`h-3.5 w-3.5 text-[#FF5A88] ${post.likedByMe ? "fill-[#FF5A88]" : "fill-none"}`}
                          />
                          {post.likeCount}
                        </button>
                        <span className="inline-flex items-center gap-0.5">
                          <MessageCircle aria-hidden className="h-3.5 w-3.5 text-[#222222]" />
                          {post.commentCount}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Eye aria-hidden className="h-3.5 w-3.5 text-[#222222]" />
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
      </div>

      <button
        aria-label="게시글 작성"
        className="fixed bottom-6 left-1/2 flex h-14 w-14 translate-x-[128px] items-center justify-center rounded-full bg-[#FF4F85] text-white shadow-[0_8px_18px_rgba(255,79,133,0.35)] max-[420px]:left-auto max-[420px]:right-5 max-[420px]:translate-x-0"
        onClick={() => router.push("/board/new")}
        type="button"
      >
        <Plus aria-hidden className="h-8 w-8" />
      </button>
    </main>
  );
}
