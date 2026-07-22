type TaskDetailHeaderProps = {
  onBack: () => void;
  title?: string;
};

export function TaskDetailHeader({ onBack, title }: TaskDetailHeaderProps) {
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
        업무상세{title ? ` - ${title}` : ""}
      </h1>
    </header>
  );
}
