import type { AdminDashboardEmployee } from "@/api/admin";
import { roleLabels, statusLabels } from "./constants";

type EmployeeListSectionProps = {
  employees: AdminDashboardEmployee[];
};

export function EmployeeListSection({ employees }: EmployeeListSectionProps) {
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-semibold text-[#5A3E3B]">직원 목록</h2>
      <div className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] p-8 shadow-[0_8px_0_#EFC6BE]">
        <div className="flex snap-x gap-6 overflow-x-auto pb-7">
          {employees.map((employee) => (
            <article
              className="w-[240px] shrink-0 snap-start rounded-[20px] border border-[#F2C9C2] bg-white px-6 py-7 text-center shadow-[0_8px_0_#EFC6BE]"
              key={employee.id}
            >
              <span
                className={`mx-auto block h-7 rounded-full border border-[#F2C9C2] px-4 text-sm font-semibold leading-7 ${
                  employee.roleType === "FACTORY_MANAGER"
                    ? "bg-[#E8F3DF] text-[#6D956A]"
                    : "bg-[#FBE6EA] text-primary"
                }`}
              >
                {roleLabels[employee.roleType]}
              </span>
              <p className="mt-8 text-2xl font-semibold text-[#5A3E3B]">{employee.name}</p>
              <p className="mt-2 text-base font-semibold text-primary">
                {employee.highestTaskStatus ? statusLabels[employee.highestTaskStatus] : "업무등록"}
              </p>
              <div className="my-5 border-t border-[#F2C9C2]" />
              <div className="space-y-2 text-sm font-semibold">
                <div className="mx-auto h-7 w-28 rounded-full border border-[#F2C9C2] bg-[#FBE6EA] leading-7 text-primary">
                  등록 {employee.taskCounts.registered}건
                </div>
                <div className="mx-auto h-7 w-28 rounded-full border border-[#F2C9C2] bg-[#EEE8FF] leading-7 text-[#8B72C8]">
                  진행 {employee.taskCounts.inProgress}건
                </div>
                <div className="mx-auto h-7 w-28 rounded-full border border-[#F2C9C2] bg-[#FFF1D7] leading-7 text-[#C88449]">
                  검토 {employee.taskCounts.reviewRequested}건
                </div>
              </div>
              <button className="mt-5 h-9 w-full rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary">
                상세정보
              </button>
            </article>
          ))}
        </div>
        <div className="mx-auto h-2 w-[38rem] max-w-full rounded-full bg-[#FBE6EA]">
          <div className="h-2 w-52 rounded-full bg-primary" />
        </div>
      </div>
    </section>
  );
}
