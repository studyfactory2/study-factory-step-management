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
              className={`h-7 rounded-[9px] border px-1 text-[10px] font-semibold transition active:scale-[0.98] ${
                isSelected
                  ? "border-[#3182f6] bg-[#3182f6] text-white shadow-[0_3px_8px_rgba(49,130,246,0.22)]"
                  : "border-[#dce5f2] bg-white text-[#6b7684] hover:bg-[#f2f7ff]"
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
        className="h-7 rounded-[9px] border border-[#d9d2ff] bg-[#f4f1ff] px-2 text-[10px] font-semibold text-[#6b5cff] transition hover:bg-[#ece8ff] active:scale-95"
        onClick={onSortToggle}
        type="button"
      >
        {sortOrder === "LATEST" ? "최신순" : "과거순"}
      </button>
    </div>
  );
}
