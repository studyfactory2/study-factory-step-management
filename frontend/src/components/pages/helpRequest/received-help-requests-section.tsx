import type { HelpRequestReceived } from "@/api/help-request";
import { roleLabels } from "@/components/adminDashboard/constants";
import { formatDateTime } from "@/components/adminDashboard/utils";
import { getStatusClassName, getStatusLabel } from "./constants";

export function ReceivedHelpRequestsSection({ receivedHelpRequests }: { receivedHelpRequests: HelpRequestReceived[] }) {
  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-4 py-4 shadow-[0_6px_0_#EFC6BE]">
      <h2 className="text-[15px] font-black text-[#3F2C28]">도움요청 받은 업무</h2>
      <div className="mt-3 overflow-hidden rounded-[14px] border border-[#F2C9C2] bg-white">
        <div className="max-h-[220px] space-y-1.5 overflow-y-auto p-2">
          {receivedHelpRequests.length === 0 && (
            <div className="px-3 py-8 text-center text-[10px] font-bold text-[#BFA4A0]">
              도움요청 받은 업무가 없습니다.
            </div>
          )}
          {receivedHelpRequests.map((request) => (
            <article
              className="grid grid-cols-[max-content_12px_max-content_12px_minmax(0,1fr)_62px_28px] grid-rows-[auto_auto] items-center gap-y-0 rounded-[12px] border border-[#F2C9C2] bg-[#FFF8F6] px-2.5 py-2"
              key={request.id}
            >
              <p className="col-start-1 row-start-1 max-w-[58px] truncate text-[7px] font-black text-[#8F7470]">
                {request.requesterPositionName ?? roleLabels[request.requesterRoleType]} {request.requesterName}
              </p>
              <span className={`col-start-3 row-start-1 flex h-3 items-center justify-center rounded-[5px] border border-[#F2C9C2] px-0.5 text-[5px] font-black leading-none ${getStatusClassName(request.taskStatus)}`}>
                {getStatusLabel(request.taskStatus)}
              </span>
              <p className="col-start-5 row-start-1 truncate text-[8px] font-black leading-3 text-[#3F2C28]">{request.taskTitle}</p>
              <p className="col-start-6 row-start-1 whitespace-nowrap text-right text-[6px] font-bold text-[#BFA4A0]">{formatDateTime(request.requestedAt)}</p>
              <button className="col-start-7 row-start-1 h-5 rounded-full bg-[#FBE6EA] px-1.5 text-[7px] font-black text-primary" type="button">
                보기
              </button>
              <p className="col-start-5 col-end-6 row-start-2 -mt-0.5 truncate text-[7px] font-bold leading-none text-[#9B7A75]">
                {request.oneLineComment || "\u00A0"}
                {request.attachments.length > 0 && (
                  <span className="ml-1 text-primary">사진 {request.attachments.length}</span>
                )}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
