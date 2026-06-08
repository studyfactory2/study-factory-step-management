type GreetingCardProps = {
  memberName: string;
};

export function GreetingCard({ memberName }: GreetingCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#F1CFD5] bg-[#FFFEFC]/95 px-8 py-7 shadow-[0_10px_22px_rgba(239,126,158,0.12)]">
      <div className="absolute right-9 top-7 text-xl font-black text-[#F188A4]">♥</div>
      <p className="text-[28px] font-black text-[#3F2C28]">안녕하세요, {memberName} 님</p>
      <p className="mt-1 text-lg font-bold text-[#9B7A75]">오늘도 즐겁게 일해요!</p>
    </section>
  );
}
