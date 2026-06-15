import { type ReactNode, useState } from "react";
import { Camera, Check, ChevronDown, Edit3 } from "lucide-react";
import { type OrganizationChartNode, type OrganizationChartNodeUpdate } from "@/api/organization-chart";
import { type OrganizationOption } from "@/api/member";

export function DepartmentSelect({
  node,
  onChange,
  organizations
}: {
  node: OrganizationChartNode;
  onChange: (nodeId: number, organizationId: number | null) => void;
  organizations: OrganizationOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOrganization = organizations.find((organization) => organization.id === node.organizationId) ?? null;
  const options: Array<OrganizationOption | null> = [null, ...organizations];

  return (
    <div className="relative">
      <button
        className="flex h-10 w-full items-center justify-between rounded-[10px] border border-[#D8D1CE] bg-[#FFFEFC] px-3 text-left text-[13px] font-normal text-[#222222] shadow-sm transition hover:border-[#B9D7EF] hover:bg-[#F7FBFF]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className={selectedOrganization ? "text-[#222222]" : "text-[#8B817D]"}>
          {selectedOrganization?.name ?? "선택 안 함"}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 text-[#6F6662] transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-[10px] border border-[#D8D1CE] bg-white py-1 shadow-[0_10px_24px_rgba(95,73,68,0.14)]">
          {options.map((organization) => {
            const isSelected = (organization?.id ?? null) === node.organizationId;

            return (
              <button
                className={`flex h-8 w-full items-center justify-between px-3 text-left text-[12px] font-normal transition ${
                  isSelected ? "bg-[#F3FAFF] text-[#416A83]" : "text-[#2F2926] hover:bg-[#FFF7F8]"
                }`}
                key={organization?.id ?? "none"}
                onClick={() => {
                  onChange(node.id, organization?.id ?? null);
                  setIsOpen(false);
                }}
                type="button"
              >
                {organization?.name ?? "선택 안 함"}
                {isSelected ? <Check aria-hidden className="h-3.5 w-3.5" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function getDepartmentRows(nodes: OrganizationChartNode[]) {
  const flatNodes = flattenResponseNodes(nodes);
  const nodeMap = new Map(flatNodes.map((node) => [node.id, node]));

  return flatNodes
    .filter((node) => {
      const parent = node.parentId ? nodeMap.get(node.parentId) : null;

      return node.floor === 2 && node.isEnabled && Boolean(parent?.isEnabled && parent.floor === 3);
    })
    .sort((left, right) => left.displayOrder - right.displayOrder || left.id - right.id)
    .map((node) => ({
      label: getDepartmentRowLabel(node.slotKey),
      node
    }));
}

function getDepartmentRowLabel(slotKey: string) {
  const [, thirdFloorIndex = "1", secondFloorIndex = "1"] = slotKey.split("-");

  return `3층-${thirdFloorIndex} / 2층-${secondFloorIndex} 사이`;
}

export function updateChartNode(
  nodes: OrganizationChartNode[],
  nodeId: number,
  updater: (node: OrganizationChartNode) => OrganizationChartNode
): OrganizationChartNode[] {
  return nodes.map((node) => {
    const nextNode = node.id === nodeId ? updater(node) : node;

    return {
      ...nextNode,
      children: updateChartNode(nextNode.children ?? [], nodeId, updater)
    };
  });
}

export function filterEnabledChartNodes(nodes: OrganizationChartNode[]): OrganizationChartNode[] {
  return nodes
    .filter((node) => node.isEnabled)
    .map((node) => ({
      ...node,
      children: filterEnabledChartNodes(node.children ?? [])
    }));
}

export function StepCard({
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
    <section className="relative overflow-visible rounded-[16px] border border-[#D8D1CE] bg-white shadow-[0_2px_10px_rgba(95,73,68,0.08)]">
      <span className={`absolute bottom-[-1px] left-[-1px] top-[-1px] w-2.5 rounded-l-[16px] ${accent}`} />
      <div className="py-3 pl-5 pr-3">
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

export function ShapeLayoutPreview({
  checkedSlotKeys,
  isEditing,
  onToggleSlot
}: {
  checkedSlotKeys: Set<string>;
  isEditing: boolean;
  onToggleSlot: (slot: ShapeSlot) => void;
}) {
  const getSlot = (slotKey: string) => shapeSlots.find((slot) => slot.slotKey === slotKey);

  return (
    <div className="mt-3 grid grid-cols-[34px_minmax(0,1fr)] text-[12px] font-normal">
      <span className="pt-1.5 text-[#222222]">3층</span>
      <div className="grid grid-cols-4 items-start gap-1">
        <div className="col-span-2 flex justify-center">
          <ShapeCheckbox
            checked={checkedSlotKeys.has("3-1")}
            isEditing={isEditing}
            label="1"
            onClick={() => onToggleSlot(getSlot("3-1") ?? shapeSlots[0])}
          />
        </div>
        <div className="col-span-2 flex justify-center">
          <ShapeCheckbox checked={checkedSlotKeys.has("3-2")} isEditing={isEditing} label="2" onClick={() => onToggleSlot(getSlot("3-2") ?? shapeSlots[1])} />
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
        {["1", "2", "1", "2"].map((label, index) => {
          const slot = getSlot(`2-${Math.floor(index / 2) + 1}-${index % 2 + 1}`);

          return (
          <div className="flex justify-center" key={`second-${label}-${index}`}>
            <ShapeCheckbox
              checked={slot ? checkedSlotKeys.has(slot.slotKey) : false}
              isEditing={isEditing}
              label={label}
              onClick={() => slot && onToggleSlot(slot)}
            />
          </div>
          );
        })}
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
            {["1", "2", "3"].map((label, index) => {
              const parentGroup = Math.floor(group / 2) + 1;
              const secondIndex = group % 2 + 1;
              const slot = getSlot(`1-${parentGroup}-${secondIndex}-${index + 1}`);

              return (
                <ShapeCheckbox
                  checked={slot ? checkedSlotKeys.has(slot.slotKey) : false}
                  isEditing={isEditing}
                  key={`first-${group}-${label}`}
                  label={label}
                  onClick={() => slot && onToggleSlot(slot)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShapeCheckbox({
  checked,
  isEditing = false,
  label,
  onClick
}: {
  checked: boolean;
  isEditing?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={`flex h-6 min-w-5 items-center justify-center gap-0.5 rounded-[5px] border px-0.5 text-[10px] font-normal text-[#222222] ${
        isEditing ? "border-[#9DC7ED] bg-[#F4FAFF]" : "border-[#CFC7C3] bg-[#FFFEFC]"
      }`}
      disabled={!isEditing}
      onClick={onClick}
      type="button"
    >
      <span className="flex h-2.5 w-2.5 items-center justify-center border border-[#8C817D] bg-white">
        {checked ? <Check aria-hidden className="h-2 w-2 text-[#222222]" /> : null}
      </span>
      {label}
    </button>
  );
}

export function StepActions({
  isEditing = false,
  onComplete,
  onEdit
}: {
  isEditing?: boolean;
  onComplete?: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 px-9">
      <button
        className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#E2C76F] bg-[#FFF3B8] text-[13px] font-normal text-[#8B6B10]"
        onClick={onEdit}
        type="button"
      >
        <Edit3 aria-hidden className="h-4 w-4" />
        수정
      </button>
      <button
        className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#2E8CDD] bg-[#1F8FE5] text-[13px] font-normal text-white"
        onClick={onComplete}
        type="button"
      >
        <Check aria-hidden className="h-4 w-4" />
        {isEditing ? "완료" : "완료"}
      </button>
    </div>
  );
}

export function OrgNodePreview({ node }: { node: OrganizationChartNode }) {
  const children = node.children ?? [];

  return (
    <div className="relative flex flex-col items-center text-center">
      <OrgPersonCard node={node} />
      {children.length > 0 ? (
        <div className="relative mt-2 min-w-max">
          <span className="absolute left-1/2 top-[-0.55rem] h-2.5 w-px -translate-x-1/2 bg-[#B9B1AD]" />
          {children.length > 1 ? (
            <span className={`absolute top-0 h-px bg-[#B9B1AD] ${getOrgConnectorClassName(children.length)}`} />
          ) : null}
          <div className={`grid gap-1.5 pt-2.5 ${children.length === 1 ? "grid-cols-1" : children.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {children.map((child) => (
              <div className="relative flex justify-center" key={child.id}>
                <span className="absolute left-1/2 top-[-0.55rem] h-2.5 w-px -translate-x-1/2 bg-[#B9B1AD]" />
                <OrgNodePreview node={child} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getOrgConnectorClassName(childCount: number) {
  if (childCount === 2) {
    return "left-[25%] right-[25%]";
  }

  return "left-[16.666%] right-[16.666%]";
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
          ? "grid-cols-1 px-1 py-1 text-[8px]"
          : "grid-cols-[22px_minmax(0,1fr)_10px] px-1.5 py-1.5 text-[9px]"
      } ${compact ? "w-[36px]" : "w-[92px]"}`}
      type="button"
    >
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border border-[#D8D1CE] bg-[#F7F7F7]">
        <Camera aria-hidden className="h-3.5 w-3.5 text-[#777777]" />
      </span>
      <span className="min-w-0">
        <span className="block truncate">직급: {node.positionName ?? node.displayName ?? "-"}</span>
        <span className="block truncate">이름: {node.memberName ?? "-"}</span>
      </span>
      {!compact ? <ChevronDown aria-hidden className="h-2.5 w-2.5 text-[#6F6662]" /> : null}
    </button>
  );
}

export function flattenChartNodes(
  nodes: OrganizationChartNode[],
  allNodes: OrganizationChartNode[] = nodes
): OrganizationChartNodeUpdate[] {
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
      parentSlotKey: findParentSlotKey(allNodes, node.parentId),
      positionId: node.positionId,
      slotKey: node.slotKey
    },
    ...flattenChartNodes(node.children ?? [], allNodes)
  ]);
}

export type ShapeSlot = {
  displayOrder: number;
  floor: number;
  label: string;
  parentSlotKey: string | null;
  slotKey: string;
};

const shapeSlots: ShapeSlot[] = [
  { displayOrder: 1, floor: 3, label: "1", parentSlotKey: null, slotKey: "3-1" },
  { displayOrder: 2, floor: 3, label: "2", parentSlotKey: null, slotKey: "3-2" },
  { displayOrder: 1, floor: 2, label: "1", parentSlotKey: "3-1", slotKey: "2-1-1" },
  { displayOrder: 2, floor: 2, label: "2", parentSlotKey: "3-1", slotKey: "2-1-2" },
  { displayOrder: 3, floor: 2, label: "1", parentSlotKey: "3-2", slotKey: "2-2-1" },
  { displayOrder: 4, floor: 2, label: "2", parentSlotKey: "3-2", slotKey: "2-2-2" },
  ...[0, 1, 2, 3].flatMap((group) => {
    const topIndex = Math.floor(group / 2) + 1;
    const secondIndex = group % 2 + 1;
    const parentSlotKey = `2-${topIndex}-${secondIndex}`;

    return [1, 2, 3].map((itemIndex) => ({
      displayOrder: group * 3 + itemIndex,
      floor: 1,
      label: String(itemIndex),
      parentSlotKey,
      slotKey: `1-${topIndex}-${secondIndex}-${itemIndex}`
    }));
  })
];

export function ensureSlotNodes(nodes: OrganizationChartNodeUpdate[], slot: ShapeSlot, tempNodeId: number) {
  const nextNodes = [...nodes];
  let nextTempNodeId = tempNodeId;
  const slotsToEnsure = getAncestorSlots(slot);

  for (const currentSlot of slotsToEnsure) {
    const existingNode = nextNodes.find((node) => node.slotKey === currentSlot.slotKey);
    if (existingNode) {
      existingNode.isEnabled = true;
      continue;
    }

    nextNodes.push({
      displayName: "직위 미정",
      displayOrder: currentSlot.displayOrder,
      floor: currentSlot.floor,
      id: nextTempNodeId,
      imageUrl: null,
      isEnabled: true,
      memberId: null,
      organizationId: null,
      parentId: null,
      parentSlotKey: currentSlot.parentSlotKey,
      positionId: null,
      slotKey: currentSlot.slotKey
    });
    nextTempNodeId -= 1;
  }

  return nextNodes;
}

function getAncestorSlots(slot: ShapeSlot) {
  const ancestors: ShapeSlot[] = [];
  let currentSlot: ShapeSlot | undefined = slot;

  while (currentSlot) {
    ancestors.unshift(currentSlot);
    currentSlot = currentSlot.parentSlotKey
      ? shapeSlots.find((item) => item.slotKey === currentSlot?.parentSlotKey)
      : undefined;
  }

  return ancestors;
}

export function isDescendantSlot(slotKey: string, parentSlotKey: string) {
  if (slotKey === parentSlotKey) {
    return true;
  }

  let currentSlot = findSlot(slotKey);
  while (currentSlot?.parentSlotKey) {
    if (currentSlot.parentSlotKey === parentSlotKey) {
      return true;
    }

    currentSlot = findSlot(currentSlot.parentSlotKey);
  }

  return false;
}

export function buildChartNodeTree(
  nodes: OrganizationChartNodeUpdate[],
  sourceNodes: OrganizationChartNode[] = []
): OrganizationChartNode[] {
  const sourceNodeMap = new Map(flattenResponseNodes(sourceNodes).map((node) => [node.id, node]));
  const sourceSlotMap = new Map(flattenResponseNodes(sourceNodes).map((node) => [node.slotKey, node]));
  const responseNodes: OrganizationChartNode[] = nodes.map((node) => {
    const sourceNode = sourceNodeMap.get(node.id) ?? sourceSlotMap.get(node.slotKey);

    return {
      ...node,
      children: [],
      memberName: sourceNode?.memberName ?? null,
      organizationName: sourceNode?.organizationName ?? null,
      positionName: sourceNode?.positionName ?? null
    };
  });
  const nodeMap = new Map(responseNodes.map((node) => [node.id, node]));
  const slotMap = new Map(responseNodes.map((node) => [node.slotKey, node]));
  const roots: OrganizationChartNode[] = [];

  for (const node of responseNodes) {
    const parent = node.parentId ? nodeMap.get(node.parentId) : slotMap.get(findSlot(node.slotKey)?.parentSlotKey ?? "");
    if (!parent) {
      roots.push(node);
      continue;
    }

    node.parentId = parent.id;
    parent.children.push(node);
  }

  sortChartNodes(roots);

  return roots;
}

function sortChartNodes(nodes: OrganizationChartNode[]) {
  nodes.sort((left, right) => left.displayOrder - right.displayOrder || left.id - right.id);
  nodes.forEach((node) => sortChartNodes(node.children));
}

function findSlot(slotKey: string) {
  return shapeSlots.find((slot) => slot.slotKey === slotKey);
}

function findParentSlotKey(nodes: OrganizationChartNode[], parentId: number | null): string | null {
  if (!parentId) {
    return null;
  }

  const flatNodes = flattenResponseNodes(nodes);
  return flatNodes.find((node) => node.id === parentId)?.slotKey ?? null;
}

function flattenResponseNodes(nodes: OrganizationChartNode[]): OrganizationChartNode[] {
  return nodes.flatMap((node) => [node, ...flattenResponseNodes(node.children ?? [])]);
}
