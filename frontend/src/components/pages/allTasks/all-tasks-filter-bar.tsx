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
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {taskStatusOptions.map((option) => {
          const isSelected = selectedStatuses.includes(option.value);

          return (
            <button
              className={`h-11 rounded-full border-2 px-6 text-sm font-black transition ${
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
        className="h-11 rounded-full border-2 border-[#D9D1F3] bg-[#F7F3FF] px-7 text-sm font-black text-[#8B72C8]"
        onClick={onSortToggle}
        type="button"
      >
        {sortOrder === "LATEST" ? "최신순" : "과거순"}
      </button>
    </div>
  );
}
