import type { LucideIcon } from "lucide-react";
import { Crown, ShieldCheck, UserRound } from "lucide-react";
import type { MemberRole } from "@/types/domain";
import { cn } from "@/util/utils";

const roles = [
  {
    id: "CEO",
    name: "대표",
    badge: "관리자",
    icon: Crown,
    className: "border-primary bg-[#FFF0F2]"
  },
  {
    id: "ADMIN",
    name: "관리자",
    badge: "관리자",
    icon: ShieldCheck,
    className: "border-[#C8D3A7] bg-[#FAF9EA]"
  },
  {
    id: "OPERATIONS_MANAGER",
    name: "운영관리자",
    badge: "관리자",
    icon: ShieldCheck,
    className: "border-[#C8D3A7] bg-[#FAF9EA]"
  },
  {
    id: "FACTORY_MANAGER",
    name: "공장장",
    badge: "관리자",
    icon: ShieldCheck,
    className: "border-[#F0D8A8] bg-[#FFF8E9]"
  },
  {
    id: "DEVELOPMENT_LEAD",
    name: "개발팀장",
    badge: "관리자",
    icon: ShieldCheck,
    className: "border-[#CDBDEB] bg-[#F6EFFF]"
  },
  {
    id: "DESIGNER",
    name: "디자이너",
    badge: "직원",
    icon: UserRound,
    className: "border-[#F5C5CF] bg-[#FFF6F8]"
  },
  {
    id: "MARKETER",
    name: "마케팅",
    badge: "직원",
    icon: UserRound,
    className: "border-[#F0D8A8] bg-[#FFF8E9]"
  },
  {
    id: "DEVELOPER",
    name: "개발자",
    badge: "직원",
    icon: UserRound,
    className: "border-[#CDBDEB] bg-[#F7F2FF]"
  },
  {
    id: "CONTENT_MANAGER",
    name: "콘텐츠 담당",
    badge: "직원",
    icon: UserRound,
    className: "border-[#C8D3A7] bg-[#F7FAEC]"
  },
  {
    id: "STAFF",
    name: "사원",
    badge: "직원",
    icon: UserRound,
    className: "border-[#F5C5CF] bg-[#FFF6F8]"
  }
] satisfies Array<{
  id: MemberRole;
  name: string;
  badge: string;
  icon: LucideIcon;
  className: string;
}>;

type RoleTreeProps = {
  selectedRole: MemberRole;
  onSelectRole: (role: MemberRole) => void;
};

export function RoleTree({ selectedRole, onSelectRole }: RoleTreeProps) {
  return (
    <div className="space-y-3">
      <button
        className={cn(
          "mx-auto flex w-36 flex-col items-center rounded-2xl border-2 px-4 py-3 text-center shadow-sm transition",
          roles[0].className,
          selectedRole === roles[0].id && "ring-2 ring-primary ring-offset-2"
        )}
        onClick={() => onSelectRole(roles[0].id)}
        type="button"
      >
        <RoleContent role={roles[0]} />
      </button>

      <div className="grid grid-cols-2 gap-3">
        {roles.slice(1, 5).map((role) => (
          <button
            key={role.id}
            className={cn(
              "flex flex-col items-center rounded-2xl border-2 px-3 py-3 text-center shadow-sm transition",
              role.className,
              selectedRole === role.id && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => onSelectRole(role.id)}
            type="button"
          >
            <RoleContent role={role} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {roles.slice(5).map((role) => (
          <button
            key={role.id}
            className={cn(
              "flex min-h-24 flex-col items-center justify-center rounded-2xl border px-2 py-2 text-center transition",
              role.className,
              selectedRole === role.id && "ring-2 ring-primary ring-offset-2"
            )}
            onClick={() => onSelectRole(role.id)}
            type="button"
          >
            <RoleContent role={role} compact />
          </button>
        ))}
      </div>
    </div>
  );
}

function RoleContent({
  role,
  compact = false
}: {
  role: (typeof roles)[number];
  compact?: boolean;
}) {
  const Icon = role.icon;

  return (
    <>
      <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <span className={cn("font-black", compact ? "text-xs" : "text-sm")}>{role.name}</span>
      <span className="mt-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
        {role.badge}
      </span>
    </>
  );
}
