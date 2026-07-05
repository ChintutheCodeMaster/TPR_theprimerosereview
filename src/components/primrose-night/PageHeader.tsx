import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
  titleClassName?: string;
}

export const PageHeader = ({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
  titleClassName,
}: PageHeaderProps) => (
  <header className={cn("mb-10 md:mb-14", className)}>
    <div className="flex items-end justify-between gap-6 flex-wrap">
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.22em] text-pn-muted-foreground mb-4">
            {eyebrow}
          </p>
        )}
        <h1 className={cn("display-lg text-pn-foreground", titleClassName)}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 font-serif italic text-lg text-pn-muted-foreground max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
    <div className="rule-thin mt-8" />
  </header>
);

export default PageHeader;
