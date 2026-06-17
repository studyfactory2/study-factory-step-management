type TaskDetailHeaderProps = {
  onBack: () => void;
  title?: string;
};

export function TaskDetailHeader({ onBack, title }: TaskDetailHeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b border-[#DCE8F5] pb-3">
      <button
        aria-label="뒤로가기"
        className="flex h-8 w-8 shrink-0 items-center justify-center bg-transparent text-[18px] font-bold leading-none text-[#111111] sm:h-9 sm:w-9 sm:text-[22px] md:h-10 md:w-10 md:text-[24px]"
        onClick={onBack}
        type="button"
      >
        ←
      </button>
      <h1 className="min-w-0 flex-1 truncate text-left text-[20px] font-normal tracking-normal text-[#1F1A18]">
        업무상세{title ? ` - ${title}` : ""}
      </h1>
    </header>
  );
}
