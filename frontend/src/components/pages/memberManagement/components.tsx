import type { Member } from "@/types/domain";
import { Trash2 } from "lucide-react";
import { type OrganizationGroup, type PositionGroup } from "./types";
import {
  formatPhoneNumber,
  formatPlainDate,
  getMemberAgeLabel,
  getMemberBranchName,
  getMemberDisplayName,
  getMemberDutyName,
  getOrganizationMeta,
  getPositionMeta,
  groupMembersByPosition
} from "./utils";

type MemberDeleteProps = {
  currentMemberId: number;
  deletingMemberId: number | null;
  onDelete: (member: Member) => void;
};

export function EmployeeOrganizationSection({
  currentMemberId,
  deletingMemberId,
  group,
  onDelete
}: { group: OrganizationGroup } & MemberDeleteProps) {
  const meta = getOrganizationMeta(group.organizationName);
  const OrganizationIcon = meta.icon;
  const positionGroups = groupMembersByPosition(group.members);

  return (
    <section className={`relative overflow-hidden rounded-[16px] border bg-white shadow-[0_2px_10px_rgba(95,73,68,0.08)] ${meta.borderClassName}`}>
      <span className={`absolute bottom-[-1px] left-[-1px] top-[-1px] w-2.5 rounded-l-[16px] ${meta.accentClassName}`} />
      <div className="py-3 pl-5 pr-2.5">
        <h2 className="flex items-center gap-2 text-[19px] font-normal text-[#222222]">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${meta.iconClassName}`}>
            <OrganizationIcon aria-hidden className="h-4 w-4" />
          </span>
          {group.organizationName}
          <span className={`rounded-full px-2 py-0.5 text-[12px] font-normal ${meta.countClassName}`}>
            {group.members.length}명
          </span>
        </h2>

        <div className="mt-2 max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {positionGroups.map((positionGroup) => (
            <EmployeePositionTable
              currentMemberId={currentMemberId}
              deletingMemberId={deletingMemberId}
              key={positionGroup.positionName}
              onDelete={onDelete}
              positionGroup={positionGroup}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmployeePositionTable({
  currentMemberId,
  deletingMemberId,
  onDelete,
  positionGroup
}: { positionGroup: PositionGroup } & MemberDeleteProps) {
  const positionMeta = getPositionMeta(positionGroup.positionName);
  const PositionIcon = positionMeta.icon;

  return (
    <div>
      <h3 className="mb-1.5 flex items-center gap-1.5 text-[14px] font-normal text-[#4F4542]">
        <span className={`inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[12px] font-normal ${positionMeta.className}`}>
          <PositionIcon aria-hidden className="h-3 w-3" />
          {positionGroup.positionName}
        </span>
        <span className="text-[12px] text-[#7B716D]">({positionGroup.members.length}명)</span>
      </h3>

      <div className="space-y-1.5">
        {positionGroup.members.map((member) => (
          <EmployeeRow
            currentMemberId={currentMemberId}
            deletingMemberId={deletingMemberId}
            key={member.id}
            member={member}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export function EmployeeRow({
  currentMemberId,
  deletingMemberId,
  member,
  onDelete
}: { member: Member } & MemberDeleteProps) {
  const isCurrentMember = member.id === currentMemberId;
  const isDeleting = deletingMemberId === member.id;

  return (
    <article className="rounded-[10px] border border-[#E6DFDC] bg-[#FFFEFC] px-2 py-2 text-[13px] font-normal text-[#4F4542] md:px-3 md:py-3 md:text-[15px]">
      <div className="grid grid-cols-[52px_minmax(0,1fr)_96px_auto] items-center gap-1.5 md:grid-cols-[76px_minmax(0,1fr)_132px_auto] md:gap-3">
        <span className="truncate text-[14px] text-[#2D70CB] md:text-[17px]">{getMemberDisplayName(member)}</span>
        <span className="truncate text-[#7B716D] md:text-[15px]">{getMemberDutyName(member)}</span>
        <span className="whitespace-nowrap text-right text-[12px] text-[#6F6662] md:text-[14px]">
          {member.phoneNumber ? formatPhoneNumber(member.phoneNumber) : null}
        </span>
        <button
          aria-label={`${getMemberDisplayName(member)} 사원 삭제`}
          className="inline-flex h-7 items-center justify-center gap-1 rounded-[8px] border border-[#FFD1D6] bg-[#FFF4F5] px-2 text-[11px] text-[#E5485D] transition-colors hover:bg-[#FFE8EB] disabled:cursor-not-allowed disabled:border-[#E6DFDC] disabled:bg-[#F7F5F4] disabled:text-[#B0A8A3] md:h-8 md:px-2.5 md:text-[13px]"
          disabled={isCurrentMember || isDeleting}
          onClick={() => onDelete(member)}
          title={isCurrentMember ? "현재 로그인한 계정은 삭제할 수 없습니다." : undefined}
          type="button"
        >
          <Trash2 aria-hidden className="h-3.5 w-3.5" />
          <span>{isDeleting ? "삭제 중" : "삭제"}</span>
        </button>
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-1 md:mt-2.5 md:gap-2">
        <EmployeeInfoPill label="나이" value={getMemberAgeLabel(member)} />
        <EmployeeInfoPill label="입사일" value={formatPlainDate(member.joinedAt ?? member.createdAt)} />
        <EmployeeInfoPill label="거주지" value={getMemberBranchName(member)} />
      </div>
    </article>
  );
}

export function EmployeeInfoPill({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="min-w-0 rounded-[8px] bg-white px-1.5 py-1 text-center leading-4 shadow-[inset_0_0_0_1px_#EFE8E5] md:flex md:min-h-9 md:items-center md:justify-center md:gap-2 md:px-2.5 md:py-2 md:text-left">
      <span className="block text-[11px] text-[#9A918C] md:text-[14px]">{label}</span>
      <span aria-hidden className="hidden text-[14px] text-[#B0A8A3] md:inline">-</span>
      <span className="block truncate text-[12px] text-[#4F4542] md:text-[14px]">{value}</span>
    </span>
  );
}
