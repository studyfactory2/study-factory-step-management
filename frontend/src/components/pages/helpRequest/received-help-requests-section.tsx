import type { HelpRequestReceived } from "@/api/help-request";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";
import { getStatusClassName, getStatusLabel } from "./constants";

export function ReceivedHelpRequestsSection({ receivedHelpRequests }: { receivedHelpRequests: HelpRequestReceived[] }) {
  return (
    <section className="rounded-[28px] border border-[#F2C9C2] bg-[#FFFEFC] px-5 py-6 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-black text-[#3F2C28]">도움요청 받은 업무</h2>
      <div className="mt-6 overflow-hidden rounded-[18px] border border-[#F2C9C2] bg-white">
        <div className="max-h-[420px] space-y-3 overflow-y-auto p-3">
          {receivedHelpRequests.length === 0 && (
            <div className="px-4 py-10 text-center text-sm font-bold text-[#BFA4A0]">
              도움요청 받은 업무가 없습니다.
            </div>
          )}
          {receivedHelpRequests.map((request) => (
            <article
              className="rounded-[16px] border border-[#F2C9C2] bg-[#FFF8F6] px-4 py-4"
              key={request.id}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-black text-[#3F2C28]">
                  {request.requesterPositionName ?? roleLabels[request.requesterRoleType]} {request.requesterName}
                </p>
                <span className={`flex h-8 shrink-0 items-center justify-center rounded-full border border-[#F2C9C2] px-3 text-xs font-black ${getStatusClassName(request.taskStatus)}`}>
                  {getStatusLabel(request.taskStatus)}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-sm font-black text-[#3F2C28]">{request.taskTitle}</p>
                <p className="mt-1 text-sm font-bold text-[#9B7A75]">{request.oneLineComment || "\u00A0"}</p>
                {request.attachments.length > 0 && (
                  <p className="mt-1 text-xs font-bold text-primary">사진 {request.attachments.length}장</p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#9B7A75]">{formatDateTime(request.requestedAt)}</p>
                <button className="h-9 rounded-full bg-[#FBE6EA] px-5 text-sm font-black text-primary" type="button">
                  보기
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
