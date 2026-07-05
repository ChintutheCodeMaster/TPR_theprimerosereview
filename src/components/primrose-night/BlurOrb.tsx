import { cn } from "@/lib/utils";

type Tone = "pink" | "sage" | "gold";

interface BlurOrbProps {
  tone?: Tone;
  className?: string;
}

const toneStyles: Record<Tone, string> = {
  pink: "bg-[radial-gradient(circle_at_center,rgba(247,200,224,0.35),transparent_65%)]",
  sage: "bg-[radial-gradient(circle_at_center,rgba(184,196,168,0.32),transparent_65%)]",
  gold: "bg-[radial-gradient(circle_at_center,rgba(212,182,120,0.32),transparent_65%)]",
};

export const BlurOrb = ({ tone = "pink", className }: BlurOrbProps) => (
  <div
    aria-hidden
    className={cn(
      "pointer-events-none absolute rounded-full blur-3xl animate-slow-pulse",
      toneStyles[tone],
      className,
    )}
  />
);

export default BlurOrb;
