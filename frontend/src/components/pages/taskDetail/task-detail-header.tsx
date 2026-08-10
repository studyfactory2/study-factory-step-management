import { Trash2 } from "lucide-react";

type TaskDetailHeaderProps = {
  canDelete?: boolean;
  onBack: () => void;
  onDelete?: () => void;
  title?: string;
};

export function TaskDetailHeader({
  canDelete = false,
  onBack,
  onDelete,
  title,
}: TaskDetailHeaderProps) {
  return (
    <header className="flex items-center gap-3 rounded-[18px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,246,255,0.94),rgba(246,241,255,0.94))] px-3 py-3 shadow-[0_8px_24px_rgba(49,91,140,0.09)]">
      <button
        aria-label="뒤로가기"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white/80 text-[18px] font-bold leading-none text-[#4e5968] shadow-sm transition hover:bg-white sm:h-10 sm:w-10 sm:text-[22px]"
        onClick={onBack}
        type="button"
      >
        ←
      </button>
      <h1 className="min-w-0 flex-1 truncate text-left text-[19px] font-bold tracking-[-0.03em] text-[#191f28] sm:text-[20px]">
        {title ?? "업무"}
      </h1>
      {canDelete && onDelete ? (
        <button
          aria-label="업무 삭제"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#d1d6db] bg-white text-[#333d4b] shadow-[0_2px_8px_rgba(0,0,0,0.07)] transition hover:border-[#b0b8c1] hover:bg-[#f2f4f6] hover:text-[#191f28] active:scale-95 sm:h-10 sm:w-10"
          onClick={onDelete}
          type="button"
        >
          <Trash2 aria-hidden className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
        </button>
      ) : null}
    </header>
  );
}
