import { cn } from "@/util/utils";

const toneClassNames = {
  pink: "bg-[#FCE0E8] text-[#EF7E9E] border-[#F4C6D2]",
  lavender: "bg-[#EEE6FA] text-[#A88DD6] border-[#D7C7EF]",
  gold: "bg-[#FFF3D9] text-[#E2A64B] border-[#F1D9A9]",
  sage: "bg-[#ECF5E5] text-[#98AE72] border-[#CEDDBD]"
};

type StatusCardProps = {
  label: string;
  value: string;
  helper: string;
  tone: keyof typeof toneClassNames;
};

export function StatusCard({ label, value, helper, tone }: StatusCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-[58px] flex-col items-center justify-center rounded-[12px] border px-1 py-1 text-center shadow-sm",
        toneClassNames[tone]
      )}
    >
      <p className="whitespace-nowrap text-[8px] font-black leading-tight text-[#6B514C]">{label}</p>
      <p className="mt-0.5 whitespace-nowrap text-[15px] font-black leading-none tracking-normal">{value}건</p>
      <p className="mt-0.5 whitespace-nowrap text-[6px] font-bold leading-[1.05] text-[#6B514C]">
        <HighlightedHelper helper={helper} />
      </p>
    </article>
  );
}

function HighlightedHelper({ helper }: { helper: string }) {
  const match = helper.match(/(\d+건)/);

  if (!match || match.index === undefined) {
    return <>{helper}</>;
  }

  const before = helper.slice(0, match.index);
  const after = helper.slice(match.index + match[0].length);

  return (
    <>
      {before}
      <strong className="text-[7px] font-black text-[#3F2C28]">{match[0]}</strong>
      {after}
    </>
  );
}
