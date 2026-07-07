import { motion } from "framer-motion";
import { FadeIn, Section } from "./motion";

const METRICS = [
  { l: "Narrative strength", v: 87, unit: "/100", trend: "+6" },
  { l: "Application balance", v: 74, unit: "/100", trend: "+3" },
  { l: "Leadership", v: 92, unit: "/100", trend: "+1" },
  { l: "Research signal", v: 68, unit: "/100", trend: "+9" },
  { l: "Interview readiness", v: 81, unit: "/100", trend: "+4" },
  { l: "Essay similarity", v: 12, unit: "% overlap", trend: "-5", inverted: true },
  { l: "Recommendation diversity", v: 3, unit: "of 4", trend: "+1" },
  { l: "Risk score", v: "Low", unit: "", trend: "stable" },
  { l: "School balance", v: "Balanced", unit: "3R · 4T · 2S", trend: "" },
];

export function Intelligence() {
  return (
    <Section id="intelligence" eyebrow="How we decide" className="bg-[#0a0a0a]">
      <FadeIn>
        <h2 className="max-w-4xl font-serif text-[32px] leading-[1.08] tracking-tight text-white sm:text-4xl md:text-6xl">
          Bringing data-driven decisions into admissions.
          <br />
          <span className="text-white/50">Knowing you really well, understanding you, and making decisions accordingly.</span>
        </h2>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b]">
          <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-white/45">
            <span>Sofia Chen · Fall 2026</span>
            <span className="text-[#f7c8e0]">◉ live</span>
          </div>
          <div className="grid gap-px bg-white/5 md:grid-cols-3">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.l}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                className="bg-[#0b0b0b] p-4 sm:p-6"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                  {m.l}
                </div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-serif text-4xl text-white">{m.v}</span>
                  <span className="text-[11px] text-white/40">{m.unit}</span>
                </div>
                {typeof m.v === "number" && (
                  <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.inverted ? 100 - m.v : m.v}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-[#f7c8e0]"
                    />
                  </div>
                )}
                {m.trend && (
                  <div className="mt-3 font-mono text-[10px] text-white/45">
                    <span className={m.trend.startsWith("-") && !m.inverted ? "text-red-400/70" : "text-[#f7c8e0]/70"}>
                      {m.trend}
                    </span>{" "}
                    vs. last review
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}
