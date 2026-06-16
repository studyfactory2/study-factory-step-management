import {
  type LucideIcon,
  Building2,
  Crown,
  Factory,
  FlaskConical,
  LibraryBig,
  ShieldCheck,
  UserRound,
  Wrench
} from "lucide-react";
import type { Member } from "@/types/domain";
import { type OrganizationGroup, type PositionGroup } from "./types";

export function groupMembersByOrganization(members: Member[]): OrganizationGroup[] {
  const groupMap = new Map<string, Member[]>();

  for (const member of members) {
    const organizationName = getMemberOrganizationName(member);
    const items = groupMap.get(organizationName) ?? [];

    items.push(member);
    groupMap.set(organizationName, items);
  }

  return Array.from(groupMap.entries())
    .sort(([left], [right]) => getOrganizationOrder(left) - getOrganizationOrder(right))
    .map(([organizationName, groupMembers]) => ({
      members: groupMembers.sort((left, right) => left.name.localeCompare(right.name, "ko-KR")),
      organizationName
    }));
}

export function groupMembersByPosition(members: Member[]): PositionGroup[] {
  const groupMap = new Map<string, Member[]>();

  for (const member of members) {
    const positionName = getMemberPositionName(member);
    const items = groupMap.get(positionName) ?? [];

    items.push(member);
    groupMap.set(positionName, items);
  }

  return Array.from(groupMap.entries())
    .sort(([left], [right]) => getPositionOrder(left) - getPositionOrder(right))
    .map(([positionName, groupMembers]) => ({
      members: groupMembers,
      positionName
    }));
}

export function getMemberOrganizationName(member: Member) {
  return member.organizationName
    ?? member.organization?.name
    ?? "소속 미지정";
}

export function getMemberPositionName(member: Member) {
  return member.positionInfo?.name ?? "직위 미지정";
}

export function getMemberBranchName(member: Member) {
  if (member.residenceCity || member.residenceDistrict) {
    return [member.residenceCity, member.residenceDistrict].filter(Boolean).join(" · ");
  }

  return member.branchName
    ?? member.branchInfo?.name
    ?? member.branch
    ?? "-";
}

export function getMemberDutyName(member: Member) {
  return member.dutyText
    ?? member.positionDuty?.name
    ?? member.positionDuty?.duty
    ?? "담당 미지정";
}

export function getOrganizationOrder(organizationName: string) {
  if (organizationName.includes("자격증공장")) {
    return 1;
  }

  if (organizationName.includes("수험생")) {
    return 2;
  }

  return 3;
}

export function getPositionOrder(positionName: string) {
  if (positionName.includes("대표") || positionName.includes("소장") || positionName.includes("공장장")) {
    return 1;
  }

  if (positionName.includes("팀장") || positionName.includes("관리자")) {
    return 2;
  }

  if (positionName.includes("스텝") || positionName.includes("연구원") || positionName.includes("개발")) {
    return 3;
  }

  if (positionName.includes("직원")) {
    return 4;
  }

  return 5;
}

export function getOrganizationMeta(organizationName: string): {
  accentClassName: string;
  borderClassName: string;
  countClassName: string;
  icon: LucideIcon;
  iconClassName: string;
} {
  if (organizationName.includes("자격증공장")) {
    return {
      accentClassName: "bg-[#FFD97D]",
      borderClassName: "border-[#F0DD96]",
      countClassName: "bg-[#FFF3B8] text-[#9B741B]",
      icon: LibraryBig,
      iconClassName: "bg-[#FFF3B8] text-[#A87928]"
    };
  }

  if (organizationName.includes("수험생")) {
    return {
      accentClassName: "bg-[#B9D7EF]",
      borderClassName: "border-[#B9D7EF]",
      countClassName: "bg-[#D8ECFF] text-[#416A83]",
      icon: Building2,
      iconClassName: "bg-[#D8ECFF] text-[#4F6F82]"
    };
  }

  return {
    accentClassName: "bg-[#D8D1CE]",
    borderClassName: "border-[#D8D1CE]",
    countClassName: "bg-[#F3F3F3] text-[#6F6662]",
    icon: Factory,
    iconClassName: "bg-[#F3F3F3] text-[#7B716D]"
  };
}

export function getPositionMeta(positionName: string): {
  className: string;
  icon: LucideIcon;
} {
  if (positionName.includes("대표") || positionName.includes("소장") || positionName.includes("공장장")) {
    return {
      className: "border-[#F0C5C5] bg-[#FFF1F1] text-[#D95858]",
      icon: Crown
    };
  }

  if (positionName.includes("관리자") || positionName.includes("팀장")) {
    return {
      className: "border-[#BFD0F2] bg-[#EEF5FF] text-[#3C67B1]",
      icon: ShieldCheck
    };
  }

  if (positionName.includes("연구")) {
    return {
      className: "border-[#F0DD96] bg-[#FFF9D9] text-[#9B741B]",
      icon: FlaskConical
    };
  }

  if (positionName.includes("스텝") || positionName.includes("개발")) {
    return {
      className: "border-[#F0DD96] bg-[#FFF9D9] text-[#9B741B]",
      icon: Wrench
    };
  }

  return {
    className: "border-[#B9D7EF] bg-[#F3FAFF] text-[#416A83]",
    icon: UserRound
  };
}

export function formatPlainDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).format(date);
}

export function formatPhoneNumber(value: string | null) {
  if (!value) {
    return "-";
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return value;
}
