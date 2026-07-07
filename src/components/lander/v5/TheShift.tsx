import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Calculator,
  Clock,
  FlaskConical,
  Layers,
  Mic,
  Trophy,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { FadeIn, Section } from "./motion";

// Old-world tools — brand-accurate SVG marks
const OLD_TOOLS: { name: string; sub: string; svg: ReactNode; tint: string }[] = [
  {
    name: "Microsoft Word",
    sub: "essay_v14_FINAL_final.docx",
    tint: "#2B579A",
    svg: (
      <svg viewBox="0 0 32 32" className="h-6 w-6">
        <rect x="3" y="5" width="26" height="22" rx="2" fill="#2B579A" />
        <text x="16" y="21" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="13" fill="#fff">W</text>
      </svg>
    ),
  },
  {
    name: "Gmail thread",
    sub: "Re: Re: Re: Yale supplement",
    tint: "#EA4335",
    svg: (
      <svg viewBox="0 0 32 32" className="h-6 w-6">
        <path d="M4 8h24v16H4z" fill="#fff" />
        <path d="M4 8l12 9L28 8v2L16 19 4 10z" fill="#EA4335" />
        <path d="M4 8v16h4V11z" fill="#C5221F" />
        <path d="M28 8v16h-4V11z" fill="#FBBC04" />
      </svg>
    ),
  },
  {
    name: "Google Drive",
    sub: "47 folders. 0 structure.",
    tint: "#1FA463",
    svg: (
      <svg viewBox="0 0 32 32" className="h-6 w-6">
        <path d="M11 4l-8 14 4 7 8-14z" fill="#1FA463" />
        <path d="M21 4H11l8 14h10z" fill="#FFC107" />
        <path d="M15 25h14l-4-7H11z" fill="#4285F4" />
      </svg>
    ),
  },
  {
    name: "Zoom call",
    sub: "60 min · every other week",
    tint: "#2D8CFF",
    svg: (
      <svg viewBox="0 0 32 32" className="h-6 w-6">
        <rect x="3" y="8" width="20" height="16" rx="3" fill="#2D8CFF" />
        <path d="M23 14l6-4v12l-6-4z" fill="#2D8CFF" />
      </svg>
    ),
  },
  {
    name: "PDF handout",
    sub: "Timeline_2024.pdf",
    tint: "#E53935",
    svg: (
      <svg viewBox="0 0 32 32" className="h-6 w-6">
        <path d="M8 3h13l5 5v21H8z" fill="#fff" opacity=".92" />
        <path d="M21 3v5h5" fill="#e0e0e0" />
        <rect x="6" y="17" width="16" height="9" rx="1.5" fill="#E53935" />
        <text x="14" y="24" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="6" fill="#fff">PDF</text>
      </svg>
    ),
  },
  {
    name: "Sticky notes",
    sub: "on someone's desk",
    tint: "#FFD54F",
    svg: (
      <svg viewBox="0 0 32 32" className="h-6 w-6">
        <rect x="5" y="5" width="22" height="22" fill="#FFE082" />
        <path d="M22 27l5-5h-5z" fill="#FBC02D" />
      </svg>
    ),
  },
];

const NEW_MODULES = [
  { i: Layers, l: "Live workspace", s: "one shared surface, always in sync" },
  { i: Mic, l: "Unlimited interview simulations", s: "practice until it feels easy" },
  { i: Clock, l: "Real-time timeline", s: "every deadline, one view" },
  { i: FlaskConical, l: "Essay testing space", s: "A/B openings, hooks, endings" },
  { i: Brain, l: "Admissions intelligence", s: "7,500 successful apps, indexed" },
  { i: Trophy, l: "Scholarship finder", s: "matched to your profile" },
  { i: Calculator, l: "Tuition calculator", s: "true cost per school" },
];

export function TheShift() {
  const [revealed, setRevealed] = useState(false);

  return (
    <Section id="shift" eyebrow="The shift">
      <FadeIn>
        <h2 className="max-w-4xl font-serif text-[34px] leading-[1.05] tracking-tight text-white sm:text-4xl md:text-6xl">
          Admissions consulting
          <br />
          <span className="text-white/50">still runs on 2005.</span>
        </h2>
      </FadeIn>

      <div className="relative mt-16">
        {/* Panel container */}
        <div className="relative min-h-[560px]">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.div
                key="old"
                initial={{ opacity: 0, x: -20, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <OldStack onReveal={() => setRevealed(true)} />
              </motion.div>
            ) : (
              <motion.div
                key="new"
                initial={{ opacity: 0, x: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 20, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <PrimroseStack onBack={() => setRevealed(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

function OldStack({ onReveal }: { onReveal: () => void }) {
  return (
    <div className="relative rounded-2xl border border-white/5 bg-[#0c0c0c] p-4 sm:p-6 md:p-10">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <div className="font-serif text-2xl text-white/70">2005</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-white/35">
            the old stack
          </div>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white/40">
          6 disconnected tools
        </span>
      </div>

      <div className="relative mx-auto min-h-[480px] max-w-3xl">
        {OLD_TOOLS.map((t, i) => {
          /* Push tools to the edges so the centre is wide open */
          const positions = [
            { top: "4%",  left: "2%",  rot: -7 },
            { top: "2%",  left: "58%", rot: 6 },
            { top: "38%", left: "0%",  rot: 5 },
            { top: "36%", left: "60%", rot: -6 },
            { top: "74%", left: "4%",  rot: -4 },
            { top: "76%", left: "56%", rot: 8 },
          ];
          const p = positions[i];
          return (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 14, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: p.rot }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
              style={{ top: p.top, left: p.left }}
              className="group absolute w-[38%] rounded-lg border border-white/10 bg-[#141414] p-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] transition-transform hover:z-10 hover:rotate-0 hover:scale-105"
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                  style={{ background: `${t.tint}18`, boxShadow: `inset 0 0 0 1px ${t.tint}30` }}
                >
                  {t.svg}
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium leading-tight text-white/85">{t.name}</div>
                  <div className="mt-0.5 truncate font-mono text-[10px] text-white/40">{t.sub}</div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* chaotic connection lines */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-30" viewBox="0 0 400 480" fill="none">
          <path d="M50 50 C 120 30, 180 120, 250 60" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 4" />
          <path d="M70 220 C 160 280, 240 140, 320 240" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 5" />
          <path d="M60 380 C 150 340, 230 420, 310 370" stroke="rgba(255,138,138,0.35)" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M200 40 C 100 180, 300 260, 120 420" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 6" />
        </svg>

        {/* notification badges */}
        <div className="absolute right-[6%] top-[22%] rounded-full bg-[#ff5a5a] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shadow-lg">12</div>
        <div className="absolute left-[42%] top-[52%] rounded-full bg-[#ff5a5a] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shadow-lg">3</div>
        <div className="absolute right-[10%] top-[82%] rounded-full bg-[#ff5a5a] px-1.5 py-0.5 font-mono text-[9px] font-bold text-white shadow-lg">7</div>

        {/* ── CENTRE CTA ── */}
        <motion.button
          onClick={onReveal}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        >
          {/* outer glow ring — flashes */}
          <span className="pointer-events-none absolute inset-0 -m-3 rounded-full border border-[#f7c8e0]/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span
            className="pointer-events-none absolute -inset-6 rounded-full"
            style={{
              background: "radial-gradient(closest-side, rgba(247,200,224,0.22), transparent 70%)",
              animation: "v2-pulse-dot 2s ease-in-out infinite",
            }}
          />

          <span className="relative flex items-center gap-3 rounded-full border border-[#f7c8e0]/30 bg-[#121212]/90 px-6 py-3.5 shadow-[0_0_40px_-10px_rgba(247,200,224,0.25)] backdrop-blur-md transition-all duration-300 group-hover:border-[#f7c8e0]/60 group-hover:shadow-[0_0_60px_-10px_rgba(247,200,224,0.35)]">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#f7c8e0]">
              How we will work together
            </span>
            <ArrowRight className="h-4 w-4 text-[#f7c8e0] transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </motion.button>
      </div>

      <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/40">
        <span>6 tabs open</span>
        <span className="text-[#ff8a8a]/80">nothing talks to anything</span>
      </div>
    </div>
  );
}

function PrimroseStack({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a] p-4 sm:p-6 md:p-10"
      style={{ boxShadow: "0 40px 120px -30px rgba(247,200,224,0.18)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(60% 60% at 70% 30%, #000 30%, transparent 80%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(247,200,224,0.25), transparent 70%)" }}
      />

      <div className="relative mb-6 flex items-baseline justify-between">
        <div>
          <div className="font-serif text-2xl text-white">2026</div>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[#f7c8e0]/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f7c8e0]" />
            the primrose stack
          </div>
        </div>
        <span className="rounded-full border border-[#f7c8e0]/25 bg-[#f7c8e0]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[#f7c8e0]">
          one platform
        </span>
      </div>

      {/* Core node */}
      <div className="relative mb-5">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 backdrop-blur">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-white to-[#f7c8e0]">
            <span className="font-serif text-lg text-black">P</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">
              primrose · core
            </div>
            <div className="text-[12px] text-white/90">
              Admissions Intelligence Runtime v2.6
            </div>
          </div>
          <div className="font-mono text-[9px] text-[#7bffb1]">● live</div>
        </div>
      </div>

      {/* Modules */}
      <div className="relative grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {NEW_MODULES.map((m, i) => (
          <motion.div
            key={m.l}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.5 }}
            className="group relative flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-sm transition-colors hover:border-[#f7c8e0]/30 hover:bg-white/[0.05]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f7c8e0]/25 bg-[#f7c8e0]/10">
              <m.i className="h-4 w-4 text-[#f7c8e0]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium leading-tight text-white/90">{m.l}</div>
              <div className="mt-1 font-mono text-[10px] leading-tight text-white/45">{m.s}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative mt-6 flex items-center justify-between rounded-lg border border-[#f7c8e0]/20 bg-[#f7c8e0]/[0.04] px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest">
        <span className="text-white/60">7 modules → 1 runtime</span>
        <span className="flex items-center gap-1.5 text-[#7bffb1]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7bffb1]" />
          everything in sync
        </span>
      </div>
    </div>
  );
}
