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
        "flex min-h-[88px] flex-col rounded-[18px] border px-3.5 py-3 shadow-sm",
        toneClassNames[tone]
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current/35 bg-white/70">
            <Icon aria-hidden className="h-3.5 w-3.5" />
          </div>
          <p className="min-w-0 truncate text-[12px] font-black text-[#6B514C]">{label}</p>
        </div>
        <p className="max-w-[72px] text-right text-[10px] font-bold leading-tight text-[#6B514C]">
          <HighlightedHelper helper={helper} />
        </p>
      </div>
      <div className="mt-2 pl-9">
        <p className="text-[25px] font-black leading-none tracking-normal">{value}건</p>
      </div>
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
      <strong className="text-[11px] font-black text-[#3F2C28]">{match[0]}</strong>
      {after}
    </>
  );
}
