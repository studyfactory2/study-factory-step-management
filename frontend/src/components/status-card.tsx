import type { LucideIcon } from "lucide-react";
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
  icon: LucideIcon;
  tone: keyof typeof toneClassNames;
};

export function StatusCard({ label, value, helper, icon: Icon, tone }: StatusCardProps) {
  return (
    <article
      className={cn(
        "grid min-h-[60px] grid-cols-[1fr_58px] grid-rows-[auto_1fr] gap-x-1.5 rounded-[13px] border px-2 py-1 shadow-sm",
        toneClassNames[tone]
      )}
    >
      <div className="col-span-2 flex min-w-0 items-center gap-1.5">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current/35 bg-white/70">
          <Icon aria-hidden className="h-2.5 w-2.5" />
        </div>
        <p className="text-[10px] font-black leading-tight text-[#6B514C]">{label}</p>
      </div>
      <div className="self-end">
        <p className="whitespace-nowrap text-[14px] font-black leading-none tracking-normal">{value}건</p>
      </div>
      <p className="self-end text-right text-[8px] font-bold leading-tight text-[#6B514C]">
        <HighlightedHelper helper={helper} />
      </p>
    </article>
  );
}

function HighlightedHelper({ helper }: { helper: string }) {
  const weeklyChangeMatch = helper.match(/^지난주 대비 (\d+건) (증가|감소)$/);

  if (weeklyChangeMatch) {
    return (
      <span className="block">
        <span className="block">지난주 대비</span>
        <span className="block">
          <strong className="text-[9px] font-black text-[#3F2C28]">{weeklyChangeMatch[1]}</strong>
          {` ${weeklyChangeMatch[2]}`}
        </span>
      </span>
    );
  }

  const match = helper.match(/(\d+건)/);

  if (!match || match.index === undefined) {
    return <>{helper}</>;
  }

  const before = helper.slice(0, match.index);
  const after = helper.slice(match.index + match[0].length);

  return (
    <>
      {before}
      <strong className="text-[9px] font-black text-[#3F2C28]">{match[0]}</strong>
      {after}
    </>
  );
}
