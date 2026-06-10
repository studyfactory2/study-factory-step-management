import type { HelpRequestReceived } from "@/api/help-request";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";
import { getStatusClassName, getStatusLabel } from "./constants";

export function ReceivedHelpRequestsSection({ receivedHelpRequests }: { receivedHelpRequests: HelpRequestReceived[] }) {
  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">도움요청 받은 업무</h2>
      <div className="mt-7 overflow-hidden rounded-[18px] border border-[#F2C9C2] bg-white">
        <div className="grid min-h-[54px] grid-cols-[1.2fr_130px_2fr_170px_72px] items-center bg-[#FFF8F6] px-6 text-sm font-black text-[#5A3E3B]">
          <span>직위 이름</span>
          <span className="text-center">상태</span>
          <span>프로젝트제목 / 한줄멘트</span>
          <span className="text-center">요청날짜와 시간</span>
          <span />
        </div>
        <div className="max-h-[420px] divide-y divide-[#F2C9C2] overflow-y-auto">
          {receivedHelpRequests.length === 0 && (
            <div className="px-6 py-10 text-center text-sm font-bold text-[#BFA4A0]">
              도움요청 받은 업무가 없습니다.
            </div>
          )}
          {receivedHelpRequests.map((request) => (
            <article
              className="grid min-h-[96px] grid-cols-[1.2fr_130px_2fr_170px_72px] items-center gap-4 px-6 py-4"
              key={request.id}
            >
              <p className="text-base font-black text-[#3F2C28]">
                {request.requesterPositionName ?? roleLabels[request.requesterRoleType]} {request.requesterName}
              </p>
              <span className={`flex h-9 items-center justify-center rounded-full border border-[#F2C9C2] text-sm font-black ${getStatusClassName(request.taskStatus)}`}>
                {getStatusLabel(request.taskStatus)}
              </span>
              <div>
                <p className="text-sm font-black text-[#3F2C28]">{request.taskTitle}</p>
                <p className="mt-1 text-sm font-bold text-[#9B7A75]">{request.oneLineComment || "\u00A0"}</p>
                {request.attachments.length > 0 && (
                  <p className="mt-1 text-xs font-bold text-primary">사진 {request.attachments.length}장</p>
                )}
              </div>
              <p className="text-center text-sm font-bold text-[#9B7A75]">{formatDateTime(request.requestedAt)}</p>
              <button className="h-10 rounded-full bg-[#FBE6EA] text-sm font-black text-primary" type="button">
                보기
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
