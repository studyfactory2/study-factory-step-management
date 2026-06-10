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
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-5 py-6 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">{isEmployee ? "내 업무 코멘트" : "활동내역"}</h2>
      <p className="mt-2 text-sm font-bold text-[#9B7A75]">코멘트 한 줄 말 · 최신순</p>
      <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto pr-3">
        {isLoading && (
          <div className="rounded-[18px] border border-dashed border-[#F2C9C2] bg-white px-5 py-8 text-center text-sm font-bold text-[#BFA4A0]">
            {isEmployee ? "내 업무 코멘트를 불러오는 중입니다." : "활동내역을 불러오는 중입니다."}
          </div>
        )}
        {message && (
          <div className="rounded-[18px] border border-dashed border-[#F2C9C2] bg-white px-5 py-8 text-center text-sm font-bold text-primary">
            {message}
          </div>
        )}
        {!isLoading && !message && activities.length === 0 && (
          <div className="rounded-[18px] border border-dashed border-[#F2C9C2] bg-white px-5 py-8 text-center text-sm font-bold text-[#BFA4A0]">
            등록된 코멘트 한 줄 말이 없습니다.
          </div>
        )}
        {activities.map((comment) => (
          <article
            className="grid items-center gap-4 rounded-[18px] border border-[#F2C9C2] bg-white px-5 py-4 "
            key={comment.id}
          >
            <p className="font-black text-[#5A3E3B]">
              {comment.creatorPositionName ?? roleLabels[comment.creatorRoleType]} {comment.creatorName}
            </p>
            <span className={`flex h-9 items-center justify-center rounded-full border border-[#F2C9C2] text-sm font-black ${getStatusClassName(comment.status)}`}>
              {getStatusLabel(comment.status)}
            </span>
            <div>
              <p className={`text-sm font-bold ${comment.oneLineComment ? "text-[#5A3E3B]" : "text-[#BFA4A0]"}`}>
                {comment.oneLineComment || "\u00A0"}
              </p>
            </div>
            <p className="text-right text-sm font-bold text-[#BFA4A0]">{formatDateTime(comment.updatedAt)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
