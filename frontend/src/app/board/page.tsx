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

type BoardTab = "NOTICE" | "EMPLOYEE";

type NoticePost = {
  id: number;
  category: string;
  title: string;
  author: string;
  position: string;
  time: string;
};

type EmployeePost = {
  id: number;
  initial: string;
  initialClassName: string;
  author: string;
  position: string;
  department: string;
  time: string;
  category: keyof typeof categoryStyles;
  title: string;
  comment: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
};

const noticePosts: NoticePost[] = [
  {
    id: 1,
    category: "공지",
    title: "[필독] 2026년 상반기 종합 워크샵 일정 안내",
    author: "김지원",
    position: "대표",
    time: "금요일 오전 09:12"
  },
  {
    id: 2,
    category: "공지",
    title: "사내 식당 메뉴 개편 안내 (6월 15일부터)",
    author: "박나라",
    position: "팀장",
    time: "목요일 오후 03:45"
  }
];

const categoryStyles = {
  lunch: {
    label: "점심후기",
    icon: "🍜",
    className: "bg-[#FFE4EC] text-[#EC4D7B]"
  },
  free: {
    label: "자유",
    icon: "🌱",
    className: "bg-[#DFF6E8] text-[#228C50]"
  },
  tip: {
    label: "꿀팁",
    icon: "💡",
    className: "bg-[#FFF0C7] text-[#D28A00]"
  },
  congrats: {
    label: "축하",
    icon: "🎂",
    className: "bg-[#FFE4EA] text-[#F04D6E]"
  },
  exercise: {
    label: "운동",
    icon: "🏃",
    className: "bg-[#DFF0FF] text-[#1676D2]"
  },
  meetup: {
    label: "모임",
    icon: "🏔️",
    className: "bg-[#E8F4FF] text-[#2C8B55]"
  }
} as const;

const employeePosts: EmployeePost[] = [
  {
    id: 1,
    initial: "지",
    initialClassName: "bg-[#FFD9E6] text-[#D82459]",
    author: "박지원",
    position: "사원",
    department: "개발팀",
    time: "금요일 오후 01:30",
    category: "lunch",
    title: "지원 회원님이 라면이 맵대요",
    comment: "매운맛 좋아하는 분 들어와요!",
    likeCount: 12,
    commentCount: 5,
    viewCount: 47
  },
  {
    id: 2,
    initial: "민",
    initialClassName: "bg-[#CFEFFF] text-[#1373C8]",
    author: "김민수",
    position: "주임",
    department: "디자인팀",
    time: "목요일 오후 06:22",
    category: "free",
    title: "사무실 근처 새로 생긴 카페 추천드려요",
    comment: "점심시간 조용한 곳 찾으시는 분 강추 :)",
    likeCount: 24,
    commentCount: 11,
    viewCount: 89
  },
  {
    id: 3,
    initial: "수",
    initialClassName: "bg-[#FFE7B8] text-[#C56A00]",
    author: "이수영",
    position: "대리",
    department: "마케팅팀",
    time: "목요일 오전 11:05",
    category: "congrats",
    title: "팀장님 승진 축하드립니다",
    comment: "다 같이 한마디씩 남겨요",
    likeCount: 18,
    commentCount: 7,
    viewCount: 62
  },
  {
    id: 4,
    initial: "현",
    initialClassName: "bg-[#CFF7DF] text-[#168B4E]",
    author: "조현우",
    position: "사원",
    department: "영업팀",
    time: "수요일 오후 05:40",
    category: "exercise",
    title: "주말 등산 같이 가실 분 모집해요",
    comment: "초보도 환영! 가벼운 코스로 가요",
    likeCount: 9,
    commentCount: 14,
    viewCount: 52
  },
  {
    id: 5,
    initial: "은",
    initialClassName: "bg-[#E6D8FF] text-[#7556D8]",
    author: "한은지",
    position: "사원",
    department: "인사팀",
    time: "수요일 오후 02:15",
    category: "meetup",
    title: "사내 그림 동호회 신규 회원 모집합니다",
    comment: "그림 좋아하시는 분 누구나 환영해요",
    likeCount: 15,
    commentCount: 8,
    viewCount: 73
  },
  {
    id: 6,
    initial: "재",
    initialClassName: "bg-[#D8F0FF] text-[#0E6DC4]",
    author: "윤재호",
    position: "주임",
    department: "개발팀",
    time: "화요일 오후 04:50",
    category: "tip",
    title: "회사 근처 맛집 BEST 5 정리해봤어요",
    comment: "점심 메뉴 고민 끝!",
    likeCount: 31,
    commentCount: 19,
    viewCount: 124
  }
];

export default function BoardRoutePage() {
  const router = useRouter();
  const [currentMember, setCurrentMember] = useState<StoredMember | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState<BoardTab>("EMPLOYEE");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const auth = getStoredAuth();

    if (!auth.accessToken || !auth.currentMember) {
      router.replace("/");
      return;
    }

    setCurrentMember(auth.currentMember);
    setIsReady(true);
  }, [router]);

  if (!isReady || !currentMember) {
    return null;
  }

  const backPath = isAdminRole(currentMember.roleType) ? "/admin-dashboard" : "/employee-dashboard";

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
            {noticePosts.map((post, index) => (
              <article className="flex gap-2 py-2 first:pt-0 last:pb-0" key={post.id}>
                <div className="mt-0.5 flex w-7 justify-center">
                  {index === 0 ? (
                    <Pin aria-hidden className="h-5 w-5 rotate-[-20deg] text-[#F04D6E]" />
                  ) : (
                    <span className="h-14 w-[3px] rounded-full bg-[#FF6A95]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-[#FFE4EC] px-2 py-0.5 text-[12px] font-normal leading-none text-[#E93566]">
                      {post.category}
                    </span>
                    <h3 className="truncate text-[15px] font-normal text-[#111111]">{post.title}</h3>
                  </div>
                  <p className="mt-1 truncate text-[12px] font-normal text-[#7B716D]">
                    <span className="text-[#1171E8]">{post.author} {post.position}</span>
                    <span className="px-1.5">·</span>
                    {post.time}
                  </p>
                </div>
              </article>
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

          <div className="divide-y divide-[#ECE7E4]">
            {employeePosts.map((post) => {
              const category = categoryStyles[post.category];

              return (
                <article className="grid grid-cols-[42px_1fr] gap-2 py-3 first:pt-1 last:pb-1" key={post.id}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-[19px] font-normal ${post.initialClassName}`}>
                    {post.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-normal text-[#7B716D]">
                      <span className="text-[14px] text-[#1171E8]">{post.author} {post.position}</span>
                      <span className="px-1.5">·</span>
                      {post.department}
                      <span className="px-1.5">·</span>
                      {post.time}
                    </p>
                    <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-normal ${category.className}`}>
                      <span aria-hidden>{category.icon}</span>
                      {category.label}
                    </div>
                    <h3 className="mt-1 truncate text-[15px] font-normal text-[#111111]">{post.title}</h3>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-[12px] font-normal text-[#7B716D]">
                        <MessageCircle aria-hidden className="mr-1 inline h-3.5 w-3.5 text-[#4F4542]" />
                        {post.comment}
                      </p>
                      <div className="flex shrink-0 items-center gap-2 text-[12px] font-normal text-[#6F6662]">
                        <span className="inline-flex items-center gap-0.5">
                          <Heart aria-hidden className="h-3.5 w-3.5 fill-[#FF5A88] text-[#FF5A88]" />
                          {post.likeCount}
                        </span>
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
        onClick={() => setMessage("게시글 작성 화면은 다음 단계에서 연결할게요.")}
        type="button"
      >
        <Plus aria-hidden className="h-8 w-8" />
      </button>
    </main>
  );
}
