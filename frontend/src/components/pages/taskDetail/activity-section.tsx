"use client";

import { useEffect, useState } from "react";
import {
  getTaskCommentActivities,
  type TaskCommentActivity
} from "@/api/task";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";
import type { MemberRole } from "@/types/domain";
import { getStatusClassName, getStatusLabel } from "./constants";

type ActivitySectionProps = {
  accessToken: string;
  currentMemberRole: MemberRole;
};

export function ActivitySection({ accessToken, currentMemberRole }: ActivitySectionProps) {
  const [activities, setActivities] = useState<TaskCommentActivity[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isEmployee = currentMemberRole === "EMPLOYEE";

  useEffect(() => {
    async function loadActivities() {
      try {
        const commentActivities = await getTaskCommentActivities(accessToken);
        setActivities(commentActivities);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "코멘트를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadActivities();
  }, [accessToken]);

  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-4 py-4 shadow-[0_6px_0_#EFC6BE]">
      <h2 className="text-[17px] font-black text-[#3F2C28]">{isEmployee ? "내 업무 코멘트" : "활동내역"}</h2>
      <div className="mt-3 max-h-[170px] space-y-2 overflow-y-auto pr-1.5">
        {isLoading && (
          <div className="rounded-[14px] border border-dashed border-[#F2C9C2] bg-white px-4 py-6 text-center text-[12px] font-bold text-[#BFA4A0]">
            {isEmployee ? "내 업무 코멘트를 불러오는 중입니다." : "활동내역을 불러오는 중입니다."}
          </div>
        )}
        {message && (
          <div className="rounded-[14px] border border-dashed border-[#F2C9C2] bg-white px-4 py-6 text-center text-[12px] font-bold text-primary">
            {message}
          </div>
        )}
        {!isLoading && !message && activities.length === 0 && (
          <div className="rounded-[14px] border border-dashed border-[#F2C9C2] bg-white px-4 py-6 text-center text-[12px] font-bold text-[#BFA4A0]">
            등록된 코멘트 한 줄 말이 없습니다.
          </div>
        )}
        {activities.map((comment) => (
          <article
            className="grid grid-cols-[48px_42px_1fr_76px] items-center gap-1 rounded-[14px] border border-[#F2C9C2] bg-white px-2 py-1.5"
            key={comment.id}
          >
            <p className="truncate text-[10px] font-black text-[#5A3E3B]">
              {comment.creatorPositionName ?? roleLabels[comment.creatorRoleType]} {comment.creatorName}
            </p>
            <span className={`flex h-3 items-center justify-center rounded-[5px] border border-[#F2C9C2] px-0.5 text-[7px] font-black leading-none ${getStatusClassName(comment.status)}`}>
              {getStatusLabel(comment.status)}
            </span>
            <p className={`truncate pl-2.5 text-[10px] font-bold ${comment.oneLineComment ? "text-[#5A3E3B]" : "text-[#BFA4A0]"}`}>
              {comment.oneLineComment || "\u00A0"}
            </p>
            <p className="whitespace-nowrap text-right text-[8px] font-bold text-[#BFA4A0]">{formatDateTime(comment.updatedAt)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
