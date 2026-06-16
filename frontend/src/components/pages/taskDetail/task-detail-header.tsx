type TaskDetailHeaderProps = {
  onBack: () => void;
  title?: string;
};

export function TaskDetailHeader({ onBack, title }: TaskDetailHeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b border-[#DCE8F5] pb-3">
      <button
        className="h-7 shrink-0 bg-transparent px-0 text-[14px] font-bold text-[#111111]"
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
