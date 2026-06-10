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
        "flex min-h-[112px] flex-col items-start justify-between rounded-[18px] border px-3.5 py-3 shadow-sm",
        toneClassNames[tone]
      )}
    >
      <div className="flex w-full items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/35 bg-white/70">
          <Icon aria-hidden className="h-4 w-4" />
        </div>
        <p className="min-w-0 truncate text-[13px] font-black text-[#6B514C]">{label}</p>
      </div>
      <div className="w-full">
        <p className="text-[26px] font-black leading-none tracking-normal">{value}건</p>
        <div className="mt-2 min-h-[34px]">
          <p className="text-[12px] font-bold leading-snug text-[#6B514C]">
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
      <strong className="text-[13px] font-black text-[#3F2C28]">{match[0]}</strong>
      {after}
    </>
  );
}
