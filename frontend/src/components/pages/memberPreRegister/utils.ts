import {
  type LucideIcon,
  Building2,
  ClipboardList,
  Code2,
  Crown,
  LibraryBig,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { type MemberPreRegistration } from "@/api/member";
import { type PositionTreeNode } from "@/api/position";
import { type FlatPosition, type PreRegistrationEditDraft } from "./types";

export const organizationOptions = ["자격증공장", "수험생연구소"];

export const residenceOptions: Record<string, string[]> = {
  "서울특별시": [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구"
  ],
  "부산광역시": [
    "강서구",
    "금정구",
    "기장군",
    "남구",
    "동구",
    "동래구",
    "부산진구",
    "북구",
    "사상구",
    "사하구",
    "서구",
    "수영구",
    "연제구",
    "영도구",
    "중구",
    "해운대구"
  ],
  "대구광역시": [
    "군위군",
    "남구",
    "달서구",
    "달성군",
    "동구",
    "북구",
    "서구",
    "수성구",
    "중구"
  ],
  "인천광역시": [
    "강화군",
    "계양구",
    "남동구",
    "동구",
    "미추홀구",
    "부평구",
    "서구",
    "연수구",
    "옹진군",
    "중구"
  ],
  "광주광역시": [
    "광산구",
    "남구",
    "동구",
    "북구",
    "서구"
  ],
  "대전광역시": [
    "대덕구",
    "동구",
    "서구",
    "유성구",
    "중구"
  ],
  "울산광역시": [
    "남구",
    "동구",
    "북구",
    "울주군",
    "중구"
  ],
  "세종특별자치시": [
    "세종시"
  ],
  "경기도": [
    "가평군",
    "고양시",
    "과천시",
    "광명시",
    "광주시",
    "구리시",
    "군포시",
    "김포시",
    "남양주시",
    "동두천시",
    "부천시",
    "성남시",
    "수원시",
    "시흥시",
    "안산시",
    "안성시",
    "안양시",
    "양주시",
    "양평군",
    "여주시",
    "연천군",
    "오산시",
    "용인시",
    "의왕시",
    "의정부시",
    "이천시",
    "파주시",
    "평택시",
    "포천시",
    "하남시",
    "화성시"
  ],
  "강원특별자치도": [
    "강릉시",
    "고성군",
    "동해시",
    "삼척시",
    "속초시",
    "양구군",
    "양양군",
    "영월군",
    "원주시",
    "인제군",
    "정선군",
    "철원군",
    "춘천시",
    "태백시",
    "평창군",
    "홍천군",
    "화천군",
    "횡성군"
  ],
  "충청북도": [
    "괴산군",
    "단양군",
    "보은군",
    "영동군",
    "옥천군",
    "음성군",
    "제천시",
    "증평군",
    "진천군",
    "청주시",
    "충주시"
  ],
  "충청남도": [
    "계룡시",
    "공주시",
    "금산군",
    "논산시",
    "당진시",
    "보령시",
    "부여군",
    "서산시",
    "서천군",
    "아산시",
    "예산군",
    "천안시",
    "청양군",
    "태안군",
    "홍성군"
  ],
  "전북특별자치도": [
    "고창군",
    "군산시",
    "김제시",
    "남원시",
    "무주군",
    "부안군",
    "순창군",
    "완주군",
    "익산시",
    "임실군",
    "장수군",
    "전주시",
    "정읍시",
    "진안군"
  ],
  "전라남도": [
    "강진군",
    "고흥군",
    "곡성군",
    "광양시",
    "구례군",
    "나주시",
    "담양군",
    "목포시",
    "무안군",
    "보성군",
    "순천시",
    "신안군",
    "여수시",
    "영광군",
    "영암군",
    "완도군",
    "장성군",
    "장흥군",
    "진도군",
    "함평군",
    "해남군",
    "화순군"
  ],
  "경상북도": [
    "경산시",
    "경주시",
    "고령군",
    "구미시",
    "김천시",
    "문경시",
    "봉화군",
    "상주시",
    "성주군",
    "안동시",
    "영덕군",
    "영양군",
    "영주시",
    "영천시",
    "예천군",
    "울릉군",
    "울진군",
    "의성군",
    "청도군",
    "청송군",
    "칠곡군",
    "포항시"
  ],
  "경상남도": [
    "거제시",
    "거창군",
    "고성군",
    "김해시",
    "남해군",
    "밀양시",
    "사천시",
    "산청군",
    "양산시",
    "의령군",
    "진주시",
    "창녕군",
    "창원시",
    "통영시",
    "하동군",
    "함안군",
    "함양군",
    "합천군"
  ],
  "제주특별자치도": [
    "서귀포시",
    "제주시"
  ]
};

export function getAffiliationLabel(affiliation: MemberPreRegistration["affiliation"]) {
  switch (affiliation) {
    case "CEO":
    case "ADMIN":
    case "DEVELOPMENT_TEAM":
      return "수험생연구소";
    case "STAFF":
      return "자격증공장";
    default:
      return "소속 미지정";
  }
}

export function getPreRegistrationOrganizationName(preRegistration: MemberPreRegistration) {
  return preRegistration.organization?.name
    ?? getAffiliationLabel(preRegistration.affiliation);
}

export function createEditDraft(preRegistration: MemberPreRegistration): PreRegistrationEditDraft {
  return {
    age: preRegistration.age ? String(preRegistration.age) : "",
    dutyText: preRegistration.dutyText
      ?? preRegistration.positionDuty?.name
      ?? preRegistration.positionDuty?.duty
      ?? preRegistration.duty
      ?? "",
    joinedAt: preRegistration.joinedAt ?? "",
    name: preRegistration.name,
    organization: getPreRegistrationOrganizationName(preRegistration),
    phoneNumber: formatPhoneInput(preRegistration.phoneNumber ?? ""),
    positionId: preRegistration.positionId ? String(preRegistration.positionId) : "",
    residenceCity: preRegistration.residenceCity ?? "",
    residenceDistrict: preRegistration.residenceDistrict ?? ""
  };
}

export function splitResidence(value: string | null): {
  city: string;
  district: string;
} {
  if (!value) {
    return {
      city: "",
      district: ""
    };
  }

  const matchedCity = Object.keys(residenceOptions).find((city) => value.startsWith(city));
  if (!matchedCity) {
    return {
      city: "",
      district: value
    };
  }

  return {
    city: matchedCity,
    district: value.slice(matchedCity.length).trim()
  };
}

export function formatResidence(preRegistration: Pick<MemberPreRegistration, "branch" | "residenceCity" | "residenceDistrict">) {
  if (preRegistration.residenceCity || preRegistration.residenceDistrict) {
    return [preRegistration.residenceCity, preRegistration.residenceDistrict].filter(Boolean).join(" · ");
  }

  return preRegistration.branch ?? "지역 미지정";
}

export function groupPreRegistrationsByOrganization(preRegistrations: MemberPreRegistration[]) {
  const groupMap = new Map<string, MemberPreRegistration[]>();

  for (const preRegistration of preRegistrations) {
    const organizationName = getPreRegistrationOrganizationName(preRegistration);
    const items = groupMap.get(organizationName) ?? [];

    items.push(preRegistration);
    groupMap.set(organizationName, items);
  }

  return Array.from(groupMap.entries()).map(([organizationName, items]) => ({
    organizationName,
    items
  }));
}

export function getOrganizationGroupMeta(organizationName: string): {
  cardClassName: string;
  countClassName: string;
  icon: LucideIcon;
  iconClassName: string;
} {
  if (organizationName.includes("자격증공장")) {
    return {
      cardClassName: "border-[#F0DD96] bg-[#FFFBE8]",
      countClassName: "bg-[#FFF3B8] text-[#9B741B]",
      icon: LibraryBig,
      iconClassName: "bg-[#FFF3B8] text-[#A87928]"
    };
  }

  if (organizationName.includes("수험생")) {
    return {
      cardClassName: "border-[#B9D7EF] bg-[#F3FAFF]",
      countClassName: "bg-[#D8ECFF] text-[#416A83]",
      icon: Building2,
      iconClassName: "bg-[#D8ECFF] text-[#4F6F82]"
    };
  }

  return {
    cardClassName: "border-[#E6DFDC] bg-[#FFFEFC]",
    countClassName: "bg-[#F3F3F3] text-[#6F6662]",
    icon: Building2,
    iconClassName: "bg-[#F3F3F3] text-[#7B716D]"
  };
}

export function getPositionBadgeMeta(positionName: string): {
  className: string;
  icon: LucideIcon;
} {
  if (positionName.includes("대표")) {
    return {
      className: "border-[#E6C36A] bg-[#FFF8DB] text-[#9B741B]",
      icon: Crown
    };
  }

  if (positionName.includes("관리자") || positionName.includes("팀장")) {
    return {
      className: "border-[#BFD0F2] bg-[#EEF5FF] text-[#3C67B1]",
      icon: ShieldCheck
    };
  }

  if (positionName.includes("개발")) {
    return {
      className: "border-[#B9D7EF] bg-[#F3FAFF] text-[#416A83]",
      icon: Code2
    };
  }

  if (positionName.includes("공장장")) {
    return {
      className: "border-[#E7C9B2] bg-[#FFF5EF] text-[#A8643B]",
      icon: Building2
    };
  }

  if (positionName.includes("스텝")) {
    return {
      className: "border-[#CFC1EA] bg-[#F7F1FF] text-[#7357A7]",
      icon: ClipboardList
    };
  }

  if (positionName.includes("직원")) {
    return {
      className: "border-[#BFD8CE] bg-[#F0FAF5] text-[#3E8B66]",
      icon: UserRound
    };
  }

  return {
    className: "border-[#D8D1CE] bg-[#F7F7F7] text-[#6F6662]",
    icon: UserRound
  };
}

export function flattenPositions(positions: PositionTreeNode[], depth = 0): FlatPosition[] {
  return positions.flatMap((position) => [
    {
      ...position,
      depth
    },
    ...flattenPositions(position.children ?? [], depth + 1)
  ]);
}

export function formatPlainDate(value: string | null) {
  if (!value) {
    return "입사일 미입력";
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

export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function formatPhoneNumber(value: string | null) {
  if (!value) {
    return "전화번호 미입력";
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return value;
}
