type GreetingCardProps = {
  memberName: string;
};

export function GreetingCard({ memberName }: GreetingCardProps) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#F1CFD5] bg-[#FFFEFC]/95 px-5 py-4 shadow-[0_10px_22px_rgba(239,126,158,0.12)]">
      <div className="absolute right-6 top-4 text-base font-black text-[#F188A4]">♥</div>
      <p className="pr-7 text-[20px] font-black text-[#3F2C28]">안녕하세요, {memberName} 님</p>
      <p className="mt-1.5 text-center text-[15px] font-bold text-[#9B7A75]">오늘도 즐겁게 일해요!</p>
    </section>
  );
}
