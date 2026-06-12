"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  Building2,
  Camera,
  Check,
  ChevronDown,
  Edit3,
  RotateCcw,
  Save,
  Tag,
  UsersRound
} from "lucide-react";
import {
  getActiveOrganizationChart,
  resetOrganizationChartFromPositionTree,
  updateActiveOrganizationChart,
  type OrganizationChart,
  type OrganizationChartNode,
  type OrganizationChartNodeUpdate
} from "@/api/organization-chart";
import { MessageBanner } from "@/components/adminDashboard/message-banner";

type OrgChartSettingsPageProps = {
  accessToken: string;
  onBack?: () => void;
};

const departmentOptions = ["자격증공장", "수험생연구소", "선택 안 함"];

const branchRows = [
  {
    label: "3층-1 / 2층-1 사이",
    value: "자격증공장"
  },
  {
    label: "3층-1 / 2층-2 사이",
    value: "선택 안 함"
  },
  {
    label: "3층-2 / 2층-1 사이",
    value: "수험생연구소"
  },
  {
    label: "3층-2 / 2층-2 사이",
    value: "수험생연구소"
  }
];

export function OrgChartSettingsPage({ accessToken, onBack }: OrgChartSettingsPageProps) {
  const [chart, setChart] = useState<OrganizationChart | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getActiveOrganizationChart()
      .then((nextChart) => {
        setChart(nextChart);
        setMessage("");
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "조직도를 불러오지 못했습니다.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (!onBack) {
    return null;
  }

  async function handleReset() {
    setIsSaving(true);
    setMessage("");

    try {
      const nextChart = await resetOrganizationChartFromPositionTree(accessToken);
      setChart(nextChart);
      setMessage("현재 직위트리 기준으로 조직도를 다시 불러왔습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "조직도를 초기화하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave() {
    if (!chart) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const nextChart = await updateActiveOrganizationChart(accessToken, flattenChartNodes(chart.nodes));
      setChart(nextChart);
      setMessage("조직도를 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "조직도를 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <div className="relative mx-auto w-full max-w-[360px] space-y-3">
        <header className="relative pb-1 text-center">
          <button
            className="absolute left-0 top-0 h-7 rounded-[9px] border border-[#D8D1CE] bg-[#F7F7F7] px-2.5 text-[11px] font-normal text-[#333333] shadow-sm"
            onClick={onBack}
            type="button"
          >
            ← 뒤로가기
          </button>
          <h1 className="flex items-center justify-center gap-2 text-[25px] font-normal text-[#111111]">
            <Building2 aria-hidden className="h-7 w-7 text-[#4F6F82]" />
            조직도 설정
          </h1>
          <p className="mt-2 text-[12px] font-normal text-[#7B716D]">
            3단계로 조직도를 만들어보세요
          </p>
        </header>

        <MessageBanner message={message} />

        <StepCard
          accent="bg-[#FFD6DC]"
          description="층별 체크박스를 선택해주세요"
          icon={<Check aria-hidden className="h-6 w-6 text-[#2F9D54]" />}
          step="1"
          title="조직도 모양 만들기"
        >
          <ShapeLayoutPreview />
          <StepActions />
        </StepCard>

        <StepCard
          accent="bg-[#D8ECFF]"
          description="각 본부 아래 부서를 지정해주세요"
          icon={<Tag aria-hidden className="h-6 w-6 text-[#4F6F82]" />}
          step="2"
          title="부서 넣기"
        >
          <div className="mt-3 space-y-2">
            {branchRows.map((row) => (
              <div className="grid grid-cols-[118px_minmax(0,1fr)] items-center gap-2" key={row.label}>
                <span className="text-[12px] font-normal text-[#222222]">{row.label}</span>
                <SelectPreview value={row.value} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-normal leading-4 text-[#7B716D]">
            선택지: {departmentOptions.join(" / ")}
          </p>
          <StepActions />
        </StepCard>

        <StepCard
          accent="bg-[#FFD6DC]"
          description="각 칸에 사진과 직급 또는 이름을 넣어주세요"
          icon={<UsersRound aria-hidden className="h-6 w-6 text-[#C24D68]" />}
          step="3"
          title="조직도 내용채우기"
        >
          {isLoading ? (
            <div className="mt-3 rounded-[12px] border border-dashed border-[#D8D1CE] bg-[#FFFEFC] px-3 py-6 text-center text-[12px] text-[#7B716D]">
              저장된 조직도를 불러오는 중입니다.
            </div>
          ) : chart?.nodes.length ? (
            <div className="mt-3 overflow-x-auto pb-1">
              <div className="flex min-w-max justify-center gap-3">
                {chart.nodes.map((node) => (
                  <OrgNodePreview key={node.id} node={node} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-[12px] border border-dashed border-[#D8D1CE] bg-[#FFFEFC] px-3 py-6 text-center text-[12px] text-[#7B716D]">
              저장된 조직도 노드가 없습니다.
            </div>
          )}
          <div className="mt-3 space-y-1 text-[10px] font-normal leading-4 text-[#7B716D]">
            <p>직급 또는 이름 둘 중 하나만 입력해도 OK!</p>
            <p>부서명은 3층 직급 아래 좌우로 갈라지는 분배 라인 위에 표시됩니다</p>
          </div>
        </StepCard>

        <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3">
          <button
            className="flex h-12 items-center justify-center gap-1.5 rounded-[12px] border border-[#D8D1CE] bg-[#F7F7F7] text-[14px] font-normal text-[#4F4542] shadow-sm"
            disabled={isSaving}
            onClick={handleReset}
            type="button"
          >
            <RotateCcw aria-hidden className="h-4 w-4" />
            초기화
          </button>
          <button
            className="flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[#2E8CDD] bg-[#1F8FE5] text-[16px] font-normal text-white shadow-sm disabled:opacity-60"
            disabled={isSaving || !chart}
            onClick={handleSave}
            type="button"
          >
            <Save aria-hidden className="h-5 w-5" />
            {isSaving ? "저장 중" : "저장하기"}
          </button>
        </div>
        <p className="text-center text-[11px] font-normal text-[#7B716D]">
          저장 후 새업무작성 화면의 업무조직도에 반영됩니다
        </p>
      </div>
    </main>
  );
}

function StepCard({
  accent,
  children,
  description,
  icon,
  step,
  title
}: {
  accent: string;
  children: ReactNode;
  description: string;
  icon: ReactNode;
  step: string;
  title: string;
}) {
  return (
    <section className="grid grid-cols-[7px_minmax(0,1fr)] overflow-hidden rounded-[16px] border border-[#D8D1CE] bg-white shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
      <span className={accent} />
      <div className="p-3">
        <h2 className="flex items-center gap-2 text-[20px] font-normal text-[#111111]">
          {icon}
          {step}. {title}
        </h2>
        <p className="mt-1 text-[12px] font-normal text-[#7B716D]">{description}</p>
        {children}
      </div>
    </section>
  );
}

function ShapeLayoutPreview() {
  return (
    <div className="mt-3 grid grid-cols-[34px_minmax(0,1fr)] text-[12px] font-normal">
      <span className="pt-1.5 text-[#222222]">3층</span>
      <div className="grid grid-cols-4 items-start gap-1">
        <div className="col-span-2 flex justify-center">
          <ShapeCheckbox checked label="1" />
        </div>
        <div className="col-span-2 flex justify-center">
          <ShapeCheckbox checked label="2" />
        </div>
      </div>

      <span />
      <div className="grid h-5 grid-cols-4 gap-1">
        {[0, 1].map((group) => (
          <div className="relative col-span-2" key={`top-connector-${group}`}>
            <span className="absolute left-1/2 top-0 h-2.5 w-px -translate-x-1/2 bg-[#B9B1AD]" />
            <span className="absolute left-1/4 right-1/4 top-2.5 h-px bg-[#B9B1AD]" />
            <span className="absolute left-1/4 top-2.5 h-2.5 w-px bg-[#B9B1AD]" />
            <span className="absolute right-1/4 top-2.5 h-2.5 w-px bg-[#B9B1AD]" />
          </div>
        ))}
      </div>

      <span className="pt-1.5 text-[#222222]">2층</span>
      <div className="grid grid-cols-4 gap-1">
        {["1", "2", "1", "2"].map((label, index) => (
          <div className="flex justify-center" key={`second-${label}-${index}`}>
            <ShapeCheckbox checked label={label} />
          </div>
        ))}
      </div>

      <span />
      <div className="grid h-5 grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((group) => (
          <div className="relative" key={`bottom-connector-${group}`}>
            <span className="absolute left-1/2 top-0 h-2.5 w-px -translate-x-1/2 bg-[#B9B1AD]" />
            <span className="absolute left-[15%] right-[15%] top-2.5 h-px bg-[#B9B1AD]" />
            <span className="absolute left-[15%] top-2.5 h-2.5 w-px bg-[#B9B1AD]" />
            <span className="absolute left-1/2 top-2.5 h-2.5 w-px -translate-x-1/2 bg-[#B9B1AD]" />
            <span className="absolute right-[15%] top-2.5 h-2.5 w-px bg-[#B9B1AD]" />
          </div>
        ))}
      </div>

      <span className="pt-1.5 text-[#222222]">1층</span>
      <div className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((group) => (
          <div className="flex justify-center gap-0.5" key={`first-${group}`}>
            {["1", "2", "3"].map((label) => (
              <ShapeCheckbox checked key={`first-${group}-${label}`} label={label} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShapeCheckbox({
  checked,
  label
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <span className="flex h-6 min-w-5 items-center justify-center gap-0.5 rounded-[5px] border border-[#CFC7C3] bg-[#FFFEFC] px-0.5 text-[10px] font-normal text-[#222222]">
      <span className="flex h-2.5 w-2.5 items-center justify-center border border-[#8C817D] bg-white">
        {checked ? <Check aria-hidden className="h-2 w-2 text-[#222222]" /> : null}
      </span>
      {label}
    </span>
  );
}

function SelectPreview({ value }: { value: string }) {
  return (
    <button
      className="flex h-10 w-full items-center justify-between rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-[13px] font-normal text-[#222222] shadow-sm"
      type="button"
    >
      {value}
      <ChevronDown aria-hidden className="h-4 w-4 text-[#6F6662]" />
    </button>
  );
}

function StepActions() {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 px-9">
      <button
        className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#E2C76F] bg-[#FFF3B8] text-[13px] font-normal text-[#8B6B10]"
        type="button"
      >
        <Edit3 aria-hidden className="h-4 w-4" />
        수정
      </button>
      <button
        className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#2E8CDD] bg-[#1F8FE5] text-[13px] font-normal text-white"
        type="button"
      >
        <Check aria-hidden className="h-4 w-4" />
        완료
      </button>
    </div>
  );
}

function OrgNodePreview({ node }: { node: OrganizationChartNode }) {
  const children = node.children ?? [];

  return (
    <div className="relative flex flex-col items-center text-center">
      <OrgPersonCard node={node} />
      {children.length > 0 ? (
        <div className="relative mt-3 min-w-max">
          <span className="absolute left-1/2 top-[-0.75rem] h-3 w-px -translate-x-1/2 bg-[#B9B1AD]" />
          <span className="absolute left-[18%] right-[18%] top-0 h-px bg-[#B9B1AD]" />
          <div className={`grid gap-2 pt-3 ${children.length === 1 ? "grid-cols-1" : children.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {children.map((child) => (
              <div className="relative flex justify-center" key={child.id}>
                <span className="absolute left-1/2 top-[-0.75rem] h-3 w-px -translate-x-1/2 bg-[#B9B1AD]" />
                <OrgNodePreview node={child} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OrgPersonCard({
  compact = false,
  node
}: {
  compact?: boolean;
  node: OrganizationChartNode;
}) {
  return (
    <button
      className={`inline-grid items-center gap-1 rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] text-left font-normal shadow-sm ${
        compact
          ? "grid-cols-1 px-1 py-1 text-[9px]"
          : "grid-cols-[28px_minmax(0,1fr)_12px] px-2 py-2 text-[11px]"
      } ${compact ? "w-[42px]" : "w-[118px]"}`}
      type="button"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-[#D8D1CE] bg-[#F7F7F7]">
        <Camera aria-hidden className="h-4 w-4 text-[#777777]" />
      </span>
      <span className="min-w-0">
        <span className="block truncate">직급: {node.positionName ?? node.displayName ?? "-"}</span>
        <span className="block truncate">이름: {node.memberName ?? "-"}</span>
      </span>
      {!compact ? <ChevronDown aria-hidden className="h-3 w-3 text-[#6F6662]" /> : null}
    </button>
  );
}

function flattenChartNodes(nodes: OrganizationChartNode[]): OrganizationChartNodeUpdate[] {
  return nodes.flatMap((node) => [
    {
      displayName: node.displayName,
      displayOrder: node.displayOrder,
      floor: node.floor,
      id: node.id,
      imageUrl: node.imageUrl,
      isEnabled: node.isEnabled,
      memberId: node.memberId,
      organizationId: node.organizationId,
      parentId: node.parentId,
      positionId: node.positionId,
      slotKey: node.slotKey
    },
    ...flattenChartNodes(node.children ?? [])
  ]);
}

export default OrgChartSettingsPage;
