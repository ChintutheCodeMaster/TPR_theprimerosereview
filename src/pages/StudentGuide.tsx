import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Feather, ShieldAlert, Sparkles } from "lucide-react";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";

const EASE = [0.2, 0.6, 0.2, 1] as const;

type Tone = "sage" | "pink" | "gold";

const points: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  body: string;
  tone: Tone;
}[] = [
  {
    icon: Feather,
    eyebrow: "The point of this place",
    title: "This is your essay. Not the machine's.",
    body: "Primrose is a coach, not a ghostwriter. Bring us your rough thoughts, your half-formed memories, the sentence that isn't working yet — and we'll help you sharpen them into something only you could have written.",
    tone: "sage",
  },
  {
    icon: ShieldAlert,
    eyebrow: "One clear line",
    title: "Don't paste an LLM's draft in and call it yours.",
    body: "Using ChatGPT, Claude, Gemini or any other model to generate an essay and submitting it as your own defeats the point of applying — and, increasingly, it's caught. Admissions offices run AI detectors. So do we.",
    tone: "pink",
  },
  {
    icon: Sparkles,
    eyebrow: "The quiet reason",
    title: "Your voice is the whole thing.",
    body: "Colleges are reading tens of thousands of essays that sound identical. The one that lands is the one that sounds like a real seventeen-year-old, thinking out loud. Let us help you find that voice — don't outsource it.",
    tone: "gold",
  },
];

const toneColor = (t: Tone) => `var(--pn-${t})`;

const StudentGuide = () => {
  const navigate = useNavigate();

  return (
    <PageShell>
      <BlurOrb tone="pink" className="top-24 -left-32 w-80 h-80" />
      <BlurOrb tone="sage" className="bottom-16 -right-24 w-96 h-96" />
      <BlurOrb tone="gold" className="top-1/2 left-1/2 -translate-x-1/2 w-72 h-72" />

      <PageHeader
        eyebrow="Before we begin"
        title={<>A quick word about how we work here.</>}
        subtitle={
          <>
            Primrose is built to sit beside you while you write — not to write in your place.
            Three things to know before you go in.
          </>
        }
      />

      {/* Three points */}
      <div className="mt-4 md:mt-8 grid gap-5 md:gap-6">
        {points.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.55, ease: EASE, delay: 0.15 + i * 0.08 }}
            >
              <HairlineCard variant={p.tone} className="p-6 md:p-8 group">
                <div className="flex items-start gap-5">
                  <div
                    className="shrink-0 rounded-xl hairline p-2.5"
                    style={{ background: `color-mix(in oklch, ${toneColor(p.tone)} 12%, transparent)` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: toneColor(p.tone) }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
                      {p.eyebrow}
                    </div>
                    <h2 className="font-serif text-2xl md:text-[28px] leading-tight tracking-[-0.01em] text-foreground">
                      {p.title}
                    </h2>
                    <p className="mt-3 text-[15px] md:text-base leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                  </div>
                </div>
              </HairlineCard>
            </motion.div>
          );
        })}
      </div>

      {/* Footnote quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
        className="mt-12 md:mt-16 flex items-center gap-6"
      >
        <span
          aria-hidden
          className="h-px w-16"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.25), transparent)",
          }}
        />
        <p className="font-serif italic text-muted-foreground text-lg md:text-xl leading-snug">
          "The essay that gets read twice is the one that sounds like you — nobody else."
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.7 }}
        className="mt-12 md:mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <button
          type="button"
          onClick={() => navigate("/student-dashboard")}
          className="group inline-flex items-center gap-2.5 rounded-xl hairline bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.25] px-6 py-3.5 text-sm text-foreground transition-all"
        >
          I understand. Take me in.
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          You can revisit this from your dashboard anytime.
        </span>
      </motion.div>
    </PageShell>
  );
};

export default StudentGuide;
