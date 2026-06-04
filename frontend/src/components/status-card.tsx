import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClassNames = {
  pink: "bg-[#FFF0F2] text-primary",
  lavender: "bg-[#F6EFFF] text-sage",
  gold: "bg-[#FFF7E6] text-accent",
  sage: "bg-[#F3F7E7] text-[#7D9469]"
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
    <article className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <div
        className={cn(
          "mb-3 flex h-10 w-10 items-center justify-center rounded-xl",
          toneClassNames[tone]
        )}
      >
        <Icon aria-hidden className="h-5 w-5" />
      </div>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black leading-none text-foreground">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{helper}</p>
    </article>
  );
}
