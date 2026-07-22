import { cn } from "@/util/utils";

const toneClassNames = {
  pink: "text-[#3182F6]",
  lavender: "text-[#8B5CF6]",
  gold: "text-[#F04452]",
  sage: "text-[#00A878]",
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
        "flex min-h-[52px] flex-col items-center justify-center rounded-[10px] bg-white px-0.5 py-1.5 text-center shadow-[0_1px_4px_rgba(0,27,55,0.06)]",
        toneClassNames[tone],
      )}
    >
      <p className="whitespace-nowrap text-[8px] font-semibold leading-tight text-[#6b7684]">
        {label}
      </p>
      <p className="mt-1 whitespace-nowrap text-base font-extrabold leading-none tracking-[-0.03em]">
        {value}
        <span className="ml-0.5 text-[8px] font-semibold text-[#8b95a1]">
          건
        </span>
      </p>
      <p className="mt-1 max-w-full truncate whitespace-nowrap text-[6px] font-medium leading-none text-[#8b95a1]">
        <HelperText helper={helper} />
      </p>
    </article>
  );
}

function HelperText({ helper }: { helper: string }) {
  const match = helper.match(/^(.*?)([↑↓])$/);

  if (!match) {
    return <>{helper}</>;
  }

  const arrow = match[2];
  const arrowClassName = arrow === "↑" ? "text-[#E30613]" : "text-[#2D70CB]";

  return (
    <>
      {match[1]}
      <strong
        className={`text-[8px] font-black sm:text-[9px] md:text-[10px] ${arrowClassName}`}
      >
        {arrow}
      </strong>
    </>
  );
}
