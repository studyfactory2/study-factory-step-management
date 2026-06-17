"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, NotebookTabs, Search } from "lucide-react";
import { getMembers } from "@/api/member";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import type { Member } from "@/types/domain";
import { EmployeeOrganizationSection } from "@/components/pages/memberManagement/components";
import {
  getMemberDisplayName,
  getMemberDutyName,
  getMemberOrganizationName,
  getMemberPositionName,
  groupMembersByOrganization
} from "@/components/pages/memberManagement/utils";


type MemberManagementPageProps = {
  onBack: () => void;
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
        || getMemberDisplayName(member).toLowerCase().includes(keyword)
        || dutyName.toLowerCase().includes(keyword)
        || getMemberPositionName(member).toLowerCase().includes(keyword);

      return matchesOrganization && matchesKeyword;
    });
  }, [members, searchKeyword, selectedOrganization]);

  const organizationGroups = useMemo(() => groupMembersByOrganization(filteredMembers), [filteredMembers]);

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <ResponsiveContainer variant="settings">
        <header className="relative pb-1 text-center">
          <button
            className="absolute left-0 top-0 h-7 rounded-[9px] border border-[#D8D1CE] bg-[#F7F7F7] px-2.5 text-[13px] font-bold text-[#333333] shadow-sm"
            onClick={onBack}
            type="button"
          >
            ←
          </button>
          <h1 className="flex items-center justify-center gap-2 text-[26px] font-normal text-[#111111]">
            <NotebookTabs aria-hidden className="h-7 w-7 text-[#222222]" />
            사원목록
          </h1>
          <p className="mt-1 text-[15px] font-normal text-[#7B716D]">총 {filteredMembers.length}명</p>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)_78px] gap-2">
          <label className="flex h-10 items-center gap-2 rounded-[12px] border border-[#D8D1CE] bg-white px-3 shadow-sm">
            <Search aria-hidden className="h-4 w-4 text-[#8D8580]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] font-normal outline-none placeholder:text-[#B0A8A3]"
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="이름, 담당업무 검색"
              value={searchKeyword}
            />
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex h-10 w-full items-center justify-center gap-1 rounded-[12px] border border-[#D8D1CE] bg-white text-[14px] font-normal text-[#4F4542] shadow-sm"
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
                    className={`block h-8 w-full rounded-[9px] px-2 text-left text-[13px] font-normal ${
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
          <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-5 text-center text-[15px] font-normal text-[#7B716D] shadow-sm">
            사원 목록을 불러오는 중입니다.
          </section>
        ) : null}

        {!isLoading && organizationGroups.length === 0 ? (
          <section className="rounded-[16px] border border-[#D8D1CE] bg-white p-5 text-center text-[15px] font-normal text-[#7B716D] shadow-sm">
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
      </ResponsiveContainer>
    </main>
  );
}

export default MemberManagementPage;
