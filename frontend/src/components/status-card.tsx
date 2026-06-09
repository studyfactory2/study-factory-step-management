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
        "flex min-h-[78px] items-center gap-3 rounded-[18px] border px-4 py-3 shadow-sm",
        toneClassNames[tone]
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-current/35 bg-white/70">
        <Icon aria-hidden className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#9C7D79]">{label}</p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-2xl font-black leading-none tracking-normal">{value}건</p>
          <p className="pb-0.5 text-right text-sm font-bold text-[#6B514C]">
            <HighlightedHelper helper={helper} />
          </p>
        </div>
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
      <strong className="text-[15px] font-black text-[#3F2C28]">{match[0]}</strong>
      {after}
    </>
  );
}
