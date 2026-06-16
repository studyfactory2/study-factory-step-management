import type { TaskStatus } from "@/types/domain";
import { taskStatusOptions, type SortOrder } from "./constants";

type AllTasksFilterBarProps = {
  onSortToggle: () => void;
  onStatusToggle: (status: TaskStatus) => void;
  selectedStatuses: TaskStatus[];
  sortOrder: SortOrder;
};

export function AllTasksFilterBar({
  onSortToggle,
  onStatusToggle,
  selectedStatuses,
  sortOrder
}: AllTasksFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-1.5">
      <div className="grid flex-1 grid-cols-4 gap-1">
        {taskStatusOptions.map((option) => {
          const isSelected = selectedStatuses.includes(option.value);

          return (
            <button
              className={`h-7 rounded-full border px-1 text-[10px] font-black transition ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-[#F2C9C2] bg-[#FFF8F6] text-[#9B7A75]"
              }`}
              key={option.value}
              onClick={() => onStatusToggle(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <button
        className="h-7 rounded-full border border-[#D9D1F3] bg-[#F7F3FF] px-2 text-[10px] font-black text-[#8B72C8]"
        onClick={onSortToggle}
        type="button"
      >
        {sortOrder === "LATEST" ? "최신순" : "과거순"}
      </button>
    </div>
  );
}
