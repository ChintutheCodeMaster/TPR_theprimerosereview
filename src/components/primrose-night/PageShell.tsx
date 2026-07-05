import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: "container" | "wide" | "full";
}

const widths: Record<NonNullable<PageShellProps["maxWidth"]>, string> = {
  container: "max-w-[1200px]",
  wide: "max-w-[1400px]",
  full: "max-w-none",
};

export const PageShell = ({
  children,
  className,
  contentClassName,
  maxWidth = "container",
}: PageShellProps) => (
  <div
    className={cn(
      "relative min-h-full w-full bg-pn-background text-pn-foreground pn-grain pn-vignette",
      className,
    )}
  >
    <div
      className={cn(
        "relative z-10 mx-auto px-6 md:px-14 py-10 md:py-16",
        widths[maxWidth],
        contentClassName,
      )}
    >
      {children}
    </div>
  </div>
);

export default PageShell;
