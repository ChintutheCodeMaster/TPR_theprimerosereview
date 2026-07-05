import { motion } from "framer-motion";

type Tone = "sage" | "pink" | "gold";

interface SignalRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  tone?: Tone;
  label?: string;
}

const toneColor: Record<Tone, string> = {
  sage: "var(--pn-sage)",
  pink: "var(--pn-pink)",
  gold: "var(--pn-gold)",
};

export const SignalRing = ({
  value,
  size = 96,
  strokeWidth = 4,
  tone = "sage",
  label,
}: SignalRingProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={toneColor[tone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-pn-foreground">
        <span className="num-display text-2xl">{clamped}</span>
        {label && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-pn-muted-foreground mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default SignalRing;
