import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "standard" | "hero" | "pink" | "sage" | "gold";

interface HairlineCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  standard: "bg-white/[0.02]",
  hero: "bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden",
  pink: "bg-white/[0.015] overflow-hidden [background-image:radial-gradient(circle_at_30%_20%,rgba(247,200,224,0.06),transparent_60%)]",
  sage: "bg-white/[0.015] overflow-hidden [background-image:radial-gradient(circle_at_30%_20%,rgba(184,196,168,0.06),transparent_60%)]",
  gold: "bg-white/[0.015] overflow-hidden [background-image:radial-gradient(circle_at_30%_20%,rgba(212,182,120,0.06),transparent_60%)]",
};

export const HairlineCard = forwardRef<HTMLDivElement, HairlineCardProps>(
  ({ variant = "standard", className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl hairline p-6",
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  ),
);

HairlineCard.displayName = "HairlineCard";

export default HairlineCard;
