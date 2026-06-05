import type { AdminDashboardBranchGroup } from "@/api/admin";

type BranchStaffSectionProps = {
  branchGroups: AdminDashboardBranchGroup[];
};

export function BranchStaffSection({ branchGroups }: BranchStaffSectionProps) {
  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-8 shadow-[0_8px_0_#EFC6BE]">
      <h2 className="text-2xl font-semibold text-[#5A3E3B]">지역별 스텝</h2>
      <div className="mt-8 grid gap-10 md:grid-cols-3">
        {branchGroups.map((branch) => (
          <article
            className="flex items-center justify-between rounded-2xl border border-[#F2C9C2] bg-white px-6 py-5 shadow-[0_7px_0_#EFC6BE]"
            key={branch.branch}
          >
            <div>
              <p className="text-lg font-semibold text-[#5A3E3B]">{branch.branch} 스텝</p>
              <p className="mt-1 text-sm font-medium text-[#9B7A75]">{branch.memberCount}명</p>
            </div>
            <button className="h-8 rounded-full border-2 border-primary bg-white px-8 text-sm font-semibold text-primary">
              개별 보기
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
