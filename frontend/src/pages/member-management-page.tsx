"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type LucideIcon,
  Building2,
  ChevronDown,
  Crown,
  Factory,
  FlaskConical,
  LibraryBig,
  NotebookTabs,
  Search,
  ShieldCheck,
  UserRound,
  Wrench
} from "lucide-react";
import { getMembers } from "@/api/member";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import type { Member } from "@/types/domain";

type MemberManagementPageProps = {
  onBack: () => void;
};

type OrganizationGroup = {
  members: Member[];
  organizationName: string;
};

type PositionGroup = {
  members: Member[];
  positionName: string;
};

export function MemberManagementPage({ onBack }: MemberManagementPageProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("전체");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getMembers()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setMembers(response.filter((member) => member.isActive));
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "사원 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDepartmentOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const organizationOptions = useMemo(() => {
    const names = members
      .map(getMemberOrganizationName)
      .filter((value, index, array) => array.indexOf(value) === index);

    return ["전체", ...names];
  }, [members]);

  const filteredMembers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return members.filter((member) => {
      const organizationName = getMemberOrganizationName(member);
      const dutyName = getMemberDutyName(member);
      const matchesOrganization = selectedOrganization === "전체" || organizationName === selectedOrganization;
      const matchesKeyword = !keyword
        || member.name.toLowerCase().includes(keyword)
        || dutyName.toLowerCase().includes(keyword)
        || getMemberPositionName(member).toLowerCase().includes(keyword);

      return matchesOrganization && matchesKeyword;
    });
  }, [members, searchKeyword, selectedOrganization]);

  const organizationGroups = useMemo(() => groupMembersByOrganization(filteredMembers), [filteredMembers]);

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="relative mx-auto w-full max-w-[360px] space-y-3">
        <header className="relative pb-1 text-center">
          <button
            className="absolute left-0 top-0 h-7 rounded-[9px] border border-[#D8D1CE] bg-[#F7F7F7] px-2.5 text-[11px] font-normal text-[#333333] shadow-sm"
            onClick={onBack}
            type="button"
          >
            ← 뒤로가기
          </button>
          <h1 className="flex items-center justify-center gap-2 text-[24px] font-normal text-[#111111]">
            <NotebookTabs aria-hidden className="h-7 w-7 text-[#222222]" />
            사원목록
          </h1>
          <p className="mt-1 text-[13px] font-normal text-[#7B716D]">총 {filteredMembers.length}명</p>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)_78px] gap-2">
          <label className="flex h-10 items-center gap-2 rounded-[12px] border border-[#D8D1CE] bg-white px-3 shadow-sm">
            <Search aria-hidden className="h-4 w-4 text-[#8D8580]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[12px] font-normal outline-none placeholder:text-[#B0A8A3]"
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="이름, 담당업무 검색"
              value={searchKeyword}
            />
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex h-10 w-full items-center justify-center gap-1 rounded-[12px] border border-[#D8D1CE] bg-white text-[12px] font-normal text-[#4F4542] shadow-sm"
              onClick={() => setIsDepartmentOpen((current) => !current)}
              type="button"
            >
              {selectedOrganization === "전체" ? "부서" : selectedOrganization.replace("수험생", "수험생 ")}
              <ChevronDown aria-hidden className="h-3.5 w-3.5" />
            </button>
            {isDepartmentOpen ? (
              <div className="absolute right-0 top-11 z-20 w-36 overflow-hidden rounded-[12px] border border-[#D8D1CE] bg-white p-1 shadow-[0_8px_18px_rgba(70,55,50,0.16)]">
                {organizationOptions.map((option) => (
                  <button
                    className={`block h-8 w-full rounded-[9px] px-2 text-left text-[11px] font-normal ${
                      option === selectedOrganization ? "bg-[#EAF3FF] text-[#2D70CB]" : "text-[#4F4542] hover:bg-[#F7F7F7]"
                    }`}
                    key={option}
                    onClick={() => {
                      setSelectedOrganization(option);
                      setIsDepartmentOpen(false);
                    }}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <MessageBanner message={errorMessage} />

        {isLoading ? (
          <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-5 text-center text-[13px] font-normal text-[#7B716D] shadow-sm">
            사원 목록을 불러오는 중입니다.
          </section>
        ) : null}

        {!isLoading && organizationGroups.length === 0 ? (
          <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-5 text-center text-[13px] font-normal text-[#7B716D] shadow-sm">
            조건에 맞는 사원이 없습니다.
          </section>
        ) : null}

        <div className="space-y-3">
          {organizationGroups.map((group) => (
            <EmployeeOrganizationSection
              group={group}
              key={group.organizationName}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function EmployeeOrganizationSection({ group }: { group: OrganizationGroup }) {
  const meta = getOrganizationMeta(group.organizationName);
  const OrganizationIcon = meta.icon;
  const positionGroups = groupMembersByPosition(group.members);

  return (
    <section className={`relative overflow-hidden rounded-[16px] border bg-white shadow-[0_2px_10px_rgba(95,73,68,0.08)] ${meta.borderClassName}`}>
      <span className={`absolute bottom-[-1px] left-[-1px] top-[-1px] w-2.5 rounded-l-[16px] ${meta.accentClassName}`} />
      <div className="py-3 pl-5 pr-2.5">
        <h2 className="flex items-center gap-2 text-[17px] font-normal text-[#222222]">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${meta.iconClassName}`}>
            <OrganizationIcon aria-hidden className="h-4 w-4" />
          </span>
          {group.organizationName}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-normal ${meta.countClassName}`}>
            {group.members.length}명
          </span>
        </h2>

        <div className="mt-2 space-y-3">
          {positionGroups.map((positionGroup) => (
            <EmployeePositionTable
              key={positionGroup.positionName}
              positionGroup={positionGroup}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function EmployeePositionTable({ positionGroup }: { positionGroup: PositionGroup }) {
  const positionMeta = getPositionMeta(positionGroup.positionName);
  const PositionIcon = positionMeta.icon;

  return (
    <div>
      <h3 className="mb-1.5 flex items-center gap-1.5 text-[12px] font-normal text-[#4F4542]">
        <span className={`inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[10px] font-normal ${positionMeta.className}`}>
          <PositionIcon aria-hidden className="h-3 w-3" />
          {positionGroup.positionName}
        </span>
        <span className="text-[10px] text-[#7B716D]">({positionGroup.members.length}명)</span>
      </h3>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[610px]">
          <div className="grid grid-cols-[70px_42px_74px_82px_106px_minmax(130px,1fr)] border-y border-dashed border-[#D8D1CE] py-1 text-center text-[10px] font-normal text-[#7B716D]">
            <span>이름</span>
            <span>나이</span>
            <span>입사일</span>
            <span>거주지</span>
            <span>전화번호</span>
            <span>담당업무</span>
          </div>
          <div className="mt-1 space-y-1">
            {positionGroup.members.map((member) => (
              <EmployeeRow key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeRow({ member }: { member: Member }) {
  return (
    <div className="grid min-h-8 grid-cols-[70px_42px_74px_82px_106px_minmax(130px,1fr)] items-center rounded-[10px] border border-[#E6DFDC] bg-[#FFFEFC] px-1 py-1 text-center text-[11px] font-normal text-[#4F4542]">
      <span className="truncate text-[#2D70CB]">{member.name}</span>
      <span>-</span>
      <span>{formatPlainDate(member.createdAt)}</span>
      <span className="truncate">{member.branchName ?? member.branch ?? "-"}</span>
      <span>-</span>
      <span className="truncate text-left">{getMemberDutyName(member)}</span>
    </div>
  );
}

function groupMembersByOrganization(members: Member[]): OrganizationGroup[] {
  const groupMap = new Map<string, Member[]>();

  for (const member of members) {
    const organizationName = getMemberOrganizationName(member);
    const items = groupMap.get(organizationName) ?? [];

    items.push(member);
    groupMap.set(organizationName, items);
  }

  return Array.from(groupMap.entries())
    .sort(([left], [right]) => getOrganizationOrder(left) - getOrganizationOrder(right))
    .map(([organizationName, groupMembers]) => ({
      members: groupMembers.sort((left, right) => left.name.localeCompare(right.name, "ko-KR")),
      organizationName
    }));
}

function groupMembersByPosition(members: Member[]): PositionGroup[] {
  const groupMap = new Map<string, Member[]>();

  for (const member of members) {
    const positionName = getMemberPositionName(member);
    const items = groupMap.get(positionName) ?? [];

    items.push(member);
    groupMap.set(positionName, items);
  }

  return Array.from(groupMap.entries())
    .sort(([left], [right]) => getPositionOrder(left) - getPositionOrder(right))
    .map(([positionName, groupMembers]) => ({
      members: groupMembers,
      positionName
    }));
}

function getMemberOrganizationName(member: Member) {
  return member.organizationName
    ?? member.organization?.name
    ?? "소속 미지정";
}

function getMemberPositionName(member: Member) {
  return member.positionInfo?.name ?? "직위 미지정";
}

function getMemberDutyName(member: Member) {
  return member.positionDuty?.name
    ?? member.positionDuty?.duty
    ?? "담당 미지정";
}

function getOrganizationOrder(organizationName: string) {
  if (organizationName.includes("자격증공장")) {
    return 1;
  }

  if (organizationName.includes("수험생")) {
    return 2;
  }

  return 3;
}

function getPositionOrder(positionName: string) {
  if (positionName.includes("대표") || positionName.includes("소장") || positionName.includes("공장장")) {
    return 1;
  }

  if (positionName.includes("팀장") || positionName.includes("관리자")) {
    return 2;
  }

  if (positionName.includes("스텝") || positionName.includes("연구원") || positionName.includes("개발")) {
    return 3;
  }

  if (positionName.includes("직원")) {
    return 4;
  }

  return 5;
}

function getOrganizationMeta(organizationName: string): {
  accentClassName: string;
  borderClassName: string;
  countClassName: string;
  icon: LucideIcon;
  iconClassName: string;
} {
  if (organizationName.includes("자격증공장")) {
    return {
      accentClassName: "bg-[#FFD97D]",
      borderClassName: "border-[#F0DD96]",
      countClassName: "bg-[#FFF3B8] text-[#9B741B]",
      icon: LibraryBig,
      iconClassName: "bg-[#FFF3B8] text-[#A87928]"
    };
  }

  if (organizationName.includes("수험생")) {
    return {
      accentClassName: "bg-[#B9D7EF]",
      borderClassName: "border-[#B9D7EF]",
      countClassName: "bg-[#D8ECFF] text-[#416A83]",
      icon: Building2,
      iconClassName: "bg-[#D8ECFF] text-[#4F6F82]"
    };
  }

  return {
    accentClassName: "bg-[#D8D1CE]",
    borderClassName: "border-[#D8D1CE]",
    countClassName: "bg-[#F3F3F3] text-[#6F6662]",
    icon: Factory,
    iconClassName: "bg-[#F3F3F3] text-[#7B716D]"
  };
}

function getPositionMeta(positionName: string): {
  className: string;
  icon: LucideIcon;
} {
  if (positionName.includes("대표") || positionName.includes("소장") || positionName.includes("공장장")) {
    return {
      className: "border-[#F0C5C5] bg-[#FFF1F1] text-[#D95858]",
      icon: Crown
    };
  }

  if (positionName.includes("관리자") || positionName.includes("팀장")) {
    return {
      className: "border-[#BFD0F2] bg-[#EEF5FF] text-[#3C67B1]",
      icon: ShieldCheck
    };
  }

  if (positionName.includes("연구")) {
    return {
      className: "border-[#F0DD96] bg-[#FFF9D9] text-[#9B741B]",
      icon: FlaskConical
    };
  }

  if (positionName.includes("스텝") || positionName.includes("개발")) {
    return {
      className: "border-[#F0DD96] bg-[#FFF9D9] text-[#9B741B]",
      icon: Wrench
    };
  }

  return {
    className: "border-[#B9D7EF] bg-[#F3FAFF] text-[#416A83]",
    icon: UserRound
  };
}

function formatPlainDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).format(date);
}

export default MemberManagementPage;
