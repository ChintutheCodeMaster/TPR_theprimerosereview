import { motion } from "framer-motion";
import { Mic, Play } from "lucide-react";

const SCHOOLS = ["Yale", "MIT", "Princeton", "Stanford", "Columbia", "Duke", "UChicago"];

// Placeholder scoring — real sessions produce longer feedback panels.
const SCORES = [
  { label: "Clarity", value: 82 },
  { label: "Specificity", value: 71 },
  { label: "Confidence", value: 88 },
];

export function InterviewLabMockup() {
  return (
    <div
      data-placeholder="interview-lab"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_40px_120px_-40px_rgba(247,200,224,0.15)]"
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#f7c8e0]">
            Interview Room
          </span>
          <span className="text-white/40">·</span>
          <span>Yale · Alumni interview simulation</span>
        </div>
        <span className="font-mono text-[10px] text-white/40">Session 04</span>
      </div>

      {/* School chips */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 px-4 py-3">
        {SCHOOLS.map((s, i) => (
          <span
            key={s}
            className={
              i === 0
                ? "rounded-full border border-[#f7c8e0]/30 bg-[#f7c8e0]/10 px-2.5 py-1 text-[11px] text-[#f7c8e0]"
                : "rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/50"
            }
          >
            {s}
          </span>
        ))}
        <span className="rounded-full border border-dashed border-white/10 px-2.5 py-1 text-[11px] text-white/30">
          +42 more
        </span>
      </div>

      <div className="grid gap-0 md:grid-cols-[1fr_1fr]">
        {/* Question / mic */}
        <div className="border-b border-white/5 p-5 md:border-b-0 md:border-r">
          <div className="text-[11px] uppercase tracking-widest text-white/40">Prompt</div>
          <p className="mt-2 font-serif text-2xl leading-tight text-white/95">
            "Why this school, and why now?"
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-[#f7c8e0]/20" />
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-[#f7c8e0]/40"
              />
              <Mic className="absolute inset-0 m-auto h-4 w-4 text-[#f7c8e0]" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-white/70">Recording · 00:47</div>
              <div className="mt-1 flex items-end gap-0.5">
                {Array.from({ length: 28 }).map((_, i) => (
                  <motion.span
                    key={i}
                    animate={{ height: [4, 10 + (i % 7) * 2, 4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.04 }}
                    className="block w-0.5 bg-white/60"
                  />
                ))}
              </div>
            </div>
            <button className="rounded-full border border-white/10 p-2 text-white/60">
              <Play className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Scoring */}
        <div className="p-5">
          <div className="text-[11px] uppercase tracking-widest text-white/40">Scored on what matters</div>
          <div className="mt-3 space-y-3">
            {SCORES.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs text-white/70">
                  <span>{s.label}</span>
                  <span className="font-mono text-white/50">{s.value}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#f7c8e0] to-white/80"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-white/75">
            <span className="text-[#f7c8e0]">Note · </span>
            You answered the "why now" half. The "why this school" half still sounds like it could
            be any school. Name a class, a lab, a person.
          </div>
        </div>
      </div>
    </div>
  );
}
