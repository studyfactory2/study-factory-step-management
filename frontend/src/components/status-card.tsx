import { cn } from "@/util/utils";

const toneClassNames = {
  pink: "bg-white text-[#2D70CB] border-[#E6DDDA]",
  lavender: "bg-white text-[#2D70CB] border-[#E6DDDA]",
  gold: "bg-white text-[#E22E46] border-[#E6DDDA]",
  sage: "bg-white text-[#2D70CB] border-[#E6DDDA]"
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
        "flex min-h-[46px] flex-col items-center justify-center rounded-[9px] border border-dashed px-0.5 py-0.5 text-center",
        toneClassNames[tone]
      )}
    >
      <p className="whitespace-nowrap text-[10px] font-black leading-tight text-[#4F4542]">{label}</p>
      <p className="mt-0.5 whitespace-nowrap text-[17px] font-black leading-none tracking-normal">{value}건</p>
      <p className="mt-0.5 whitespace-nowrap text-[7px] font-bold leading-[1.05] text-[#4F4542]">
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
      <strong className={`text-[8px] font-black ${arrowClassName}`}>{arrow}</strong>
    </>
  );
}
