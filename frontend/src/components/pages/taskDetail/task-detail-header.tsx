type TaskDetailHeaderProps = {
  onBack: () => void;
  onHelpRequestOpen: () => void;
};

export function TaskDetailHeader({ onBack, onHelpRequestOpen }: TaskDetailHeaderProps) {
  return (
    <header className="relative flex items-center justify-center">
      <button
        className="absolute left-0 h-7 rounded-full border border-[#F2C9C2] bg-white px-3 text-[10px] font-black text-[#9B7A75] shadow-sm"
        onClick={onBack}
        type="button"
      >
        ← 뒤로
      </button>
      <h1 className="text-[21px] font-black tracking-normal text-[#3F2C28]">업무상세</h1>
      <button
        className="absolute right-0 h-7 rounded-full bg-primary px-3 text-[10px] font-black text-white shadow-sm"
        onClick={onHelpRequestOpen}
        type="button"
      >
        도움요청
      </button>
    </header>
  );
}
