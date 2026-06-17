import type { ReactNode } from "react";

type ResponsiveContainerVariant =
  | "board"
  | "dashboard"
  | "detail"
  | "form"
  | "settings";

type ResponsiveContainerProps = {
  children: ReactNode;
  className?: string;
  variant: ResponsiveContainerVariant;
};

const variantClassNames: Record<ResponsiveContainerVariant, string> = {
  board: "max-w-[380px] sm:max-w-xl md:max-w-2xl lg:max-w-4xl",
  dashboard: "max-w-[360px] sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl",
  detail: "max-w-[360px] sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
  form: "max-w-[360px] sm:max-w-xl md:max-w-3xl lg:max-w-5xl",
  settings: "max-w-[360px] sm:max-w-xl md:max-w-3xl lg:max-w-5xl"
};

export function ResponsiveContainer({
  children,
  className = "",
  variant
}: ResponsiveContainerProps) {
  const spacingClassName = className.includes("space-y-") || className.includes("pb-")
    ? ""
    : "space-y-3";

  return (
    <div className={`relative mx-auto w-full ${variantClassNames[variant]} ${spacingClassName} ${className}`.trim()}>
      {children}
    </div>
  );
}
