type HelpRequestHeaderProps = {
  onBack: () => void;
};

export function HelpRequestHeader({ onBack }: HelpRequestHeaderProps) {
  return (
    <header className="relative flex items-center justify-center">
      <button
        className="absolute left-0 h-11 rounded-full border border-[#F2C9C2] bg-white px-7 text-sm font-black text-[#9B7A75] shadow-sm"
        onClick={onBack}
        type="button"
      >
        ← 뒤로가기
      </button>
      <div className="text-center">
        <h1 className="text-[34px] font-black tracking-normal text-[#3F2C28]">도움요청</h1>
      </div>
    </header>
  );
}
