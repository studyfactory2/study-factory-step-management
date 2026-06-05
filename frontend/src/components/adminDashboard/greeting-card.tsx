type GreetingCardProps = {
  memberName: string;
};

export function GreetingCard({ memberName }: GreetingCardProps) {
  return (
    <section className="rounded-[22px] border border-[#F2C9C2] bg-[#FFFEFC] px-8 py-7 shadow-[0_8px_0_#EFC6BE]">
      <p className="text-[28px] font-medium text-[#5A3E3B]">안녕하세요, {memberName} 님</p>
      <p className="mt-1 text-lg font-medium text-[#9B7A75]">오늘도 즐겁게 일해요! ♥</p>
    </section>
  );
}
