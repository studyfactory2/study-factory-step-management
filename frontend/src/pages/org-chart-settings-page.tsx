"use client";

import { useEffect, useState } from "react";
import { Building2, Check, RotateCcw, Save, Tag, UsersRound } from "lucide-react";
import {
  getActiveOrganizationChart,
  resetOrganizationChartFromPositionTree,
  updateActiveOrganizationChart,
  type OrganizationChart,
  type OrganizationChartNodeUpdate
} from "@/api/organization-chart";
import { getOrganizations, type OrganizationOption } from "@/api/member";
import { MessageBanner } from "@/components/adminDashboard/message-banner";
import { ResponsiveContainer } from "@/components/layout/responsive-container";
import {
  buildChartNodeTree,
  DepartmentSelect,
  ensureSlotNodes,
  filterEnabledChartNodes,
  flattenChartNodes,
  getDepartmentRows,
  isDescendantSlot,
  OrgNodePreview,
  ShapeLayoutPreview,
  StepActions,
  StepCard,
  type ShapeSlot,
  updateChartNode
} from "@/components/pages/orgChartSettings/sections";


type OrgChartSettingsPageProps = {
  accessToken: string;
  onBack?: () => void;
};

export function OrgChartSettingsPage({ accessToken, onBack }: OrgChartSettingsPageProps) {
  const [chart, setChart] = useState<OrganizationChart | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isShapeEditing, setIsShapeEditing] = useState(false);
  const [shapeDraftNodes, setShapeDraftNodes] = useState<OrganizationChartNodeUpdate[]>([]);
  const [tempNodeId, setTempNodeId] = useState(-1);

  useEffect(() => {
    Promise.all([getActiveOrganizationChart(), getOrganizations()])
      .then(([nextChart, nextOrganizations]) => {
        setChart(nextChart);
        setOrganizations(nextOrganizations);
        setMessage("");
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "조직도를 불러오지 못했습니다.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const departmentRows = chart ? getDepartmentRows(chart.nodes) : [];
  const enabledChartNodes = chart ? filterEnabledChartNodes(chart.nodes) : [];
  const shapePreviewNodes = isShapeEditing ? shapeDraftNodes : flattenChartNodes(chart?.nodes ?? []);

  if (!onBack) {
    return null;
  }

  async function handleReset() {
    if (!window.confirm("정말 초기화하겠습니까?")) {
      return;
    }

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

  function handleDepartmentChange(nodeId: number, organizationId: number | null) {
    if (!chart) {
      return;
    }

    const selectedOrganization = organizations.find((organization) => organization.id === organizationId) ?? null;
    setChart({
      ...chart,
      nodes: updateChartNode(chart.nodes, nodeId, (node) => ({
        ...node,
        organizationId,
        organizationName: selectedOrganization?.name ?? null
      }))
    });
  }

  function handleStartShapeEdit() {
    setShapeDraftNodes(flattenChartNodes(chart?.nodes ?? []));
    setIsShapeEditing(true);
  }

  function handleCompleteShapeEdit() {
    if (!isShapeEditing) {
      return;
    }

    if (chart) {
      setChart({
        ...chart,
        nodes: buildChartNodeTree(shapeDraftNodes, chart.nodes)
      });
    }

    setIsShapeEditing(false);
  }

  function handleToggleShapeSlot(slot: ShapeSlot) {
    if (!isShapeEditing) {
      return;
    }

    const existingNode = shapeDraftNodes.find((node) => node.slotKey === slot.slotKey);
    const isChecked = Boolean(existingNode?.isEnabled);
    const negativeNodeCount = shapeDraftNodes.filter((node) => node.id < 0).length;
    const nextFlatNodes = isChecked
      ? shapeDraftNodes.map((node) => isDescendantSlot(node.slotKey, slot.slotKey) ? { ...node, isEnabled: false } : node)
      : ensureSlotNodes(shapeDraftNodes, slot, tempNodeId);
    const nextNegativeNodeCount = nextFlatNodes.filter((node) => node.id < 0).length;

    setTempNodeId((currentId) => currentId - Math.max(nextNegativeNodeCount - negativeNodeCount, 0));
    setShapeDraftNodes(nextFlatNodes);
  }

  return (
    <main className="login-pdf-font min-h-dvh bg-[#FFFEFC] px-3 py-4 text-[#222222]">
      <ResponsiveContainer variant="settings">
        <header className="relative pb-1 text-center">
          <button
            className="absolute left-0 top-0 h-7 rounded-[9px] border border-[#D8D1CE] bg-[#F7F7F7] px-2.5 text-[13px] font-bold text-[#333333] shadow-sm"
            onClick={onBack}
            type="button"
          >
            ←
          </button>
          <h1 className="flex items-center justify-center gap-2 text-[27px] font-normal text-[#111111]">
            <Building2 aria-hidden className="h-7 w-7 text-[#4F6F82]" />
            조직도 설정
          </h1>
          <p className="mt-2 text-[14px] font-normal text-[#7B716D]">
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
          <ShapeLayoutPreview
            checkedSlotKeys={new Set(shapePreviewNodes.filter((node) => node.isEnabled).map((node) => node.slotKey))}
            isEditing={isShapeEditing}
            onToggleSlot={handleToggleShapeSlot}
          />
          <StepActions
            isEditing={isShapeEditing}
            onComplete={handleCompleteShapeEdit}
            onEdit={handleStartShapeEdit}
          />
        </StepCard>

        <StepCard
          accent="bg-[#D8ECFF]"
          description="각 본부 아래 부서를 지정해주세요"
          icon={<Tag aria-hidden className="h-6 w-6 text-[#4F6F82]" />}
          step="2"
          title="부서 넣기"
        >
          <div className="mt-3 space-y-2">
            {departmentRows.length > 0 ? (
              departmentRows.map((row) => (
                <div className="grid grid-cols-[118px_minmax(0,1fr)] items-center gap-2" key={row.node.slotKey}>
                  <span className="text-[14px] font-normal text-[#222222]">{row.label}</span>
                  <DepartmentSelect
                    node={row.node}
                    onChange={handleDepartmentChange}
                    organizations={organizations}
                  />
                </div>
              ))
            ) : (
              <div className="rounded-[12px] border border-dashed border-[#D8D1CE] bg-[#FFFEFC] px-3 py-4 text-center text-[14px] font-normal text-[#7B716D]">
                체크된 3층-2층 연결 구간이 없습니다.
              </div>
            )}
          </div>
          <p className="mt-3 text-[13px] font-normal leading-4 text-[#7B716D]">
            체크된 2층 칸만 부서 입력 구간으로 표시됩니다
          </p>
          <div className="mt-3 flex justify-end">
            <button
              className="flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-[#B9D7EF] bg-[#F3FAFF] px-4 text-[15px] font-normal text-[#416A83] shadow-sm disabled:opacity-60"
              disabled={isSaving || !chart}
              onClick={handleSave}
              type="button"
            >
              <Save aria-hidden className="h-4 w-4" />
              {isSaving ? "저장 중" : "저장하기"}
            </button>
          </div>
        </StepCard>

        <StepCard
          accent="bg-[#FFD6DC]"
          description="각 칸에 사진과 직급 또는 이름을 넣어주세요"
          icon={<UsersRound aria-hidden className="h-6 w-6 text-[#C24D68]" />}
          step="3"
          title="조직도 내용채우기"
        >
          {isLoading ? (
            <div className="mt-3 rounded-[12px] border border-dashed border-[#D8D1CE] bg-[#FFFEFC] px-3 py-6 text-center text-[14px] text-[#7B716D]">
              저장된 조직도를 불러오는 중입니다.
            </div>
          ) : enabledChartNodes.length ? (
            <div className="mt-3 overflow-x-auto pb-1">
              <div className="flex min-w-max justify-center gap-2">
                {enabledChartNodes.map((node) => (
                  <OrgNodePreview key={node.id} node={node} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-[12px] border border-dashed border-[#D8D1CE] bg-[#FFFEFC] px-3 py-6 text-center text-[14px] text-[#7B716D]">
              저장된 조직도 노드가 없습니다.
            </div>
          )}
          <div className="mt-3 space-y-1 text-[12px] font-normal leading-4 text-[#7B716D]">
            <p>직급 또는 이름 둘 중 하나만 입력해도 OK!</p>
            <p>부서명은 3층 직급 아래 좌우로 갈라지는 분배 라인 위에 표시됩니다</p>
          </div>

          <div className="mt-3 grid grid-cols-[92px_minmax(0,1fr)] gap-3">
            <button
              className="flex h-12 items-center justify-center gap-1.5 rounded-[12px] border border-[#D8D1CE] bg-[#F7F7F7] text-[16px] font-normal text-[#4F4542] shadow-sm"
              disabled={isSaving}
              onClick={handleReset}
              type="button"
            >
              <RotateCcw aria-hidden className="h-4 w-4" />
              초기화
            </button>
            <button
              className="flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[#2E8CDD] bg-[#1F8FE5] text-[18px] font-normal text-white shadow-sm disabled:opacity-60"
              disabled={isSaving || !chart}
              onClick={handleSave}
              type="button"
            >
              <Save aria-hidden className="h-5 w-5" />
              {isSaving ? "저장 중" : "저장하기"}
            </button>
          </div>
          <p className="mt-2 text-center text-[13px] font-normal text-[#7B716D]">
            저장 후 새업무작성 화면의 업무조직도에 반영됩니다
          </p>
        </StepCard>
      </ResponsiveContainer>
    </main>
  );
}

export default OrgChartSettingsPage;
