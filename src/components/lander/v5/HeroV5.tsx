import { ArrowRight, Bell, CheckCircle2, FileText, MessageSquare, Mic, Sparkles, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FadeIn } from "./motion";

const TICKER_LINES = [
  "\u201CI only take ten students a year.\u201D",
  "\u201CYour essay is fine. Just send it.\u201D",
  "\u201CI don\u2019t remember which school this was for.\u201D",
  "\u201CHave your parents call my assistant.\u201D",
  "\u201CThat draft needs more... you.\u201D",
  "\u201CMy rate went up this season.\u201D",
  "\u201CI don\u2019t work evenings. Or weekends.\u201D",
  "\u201CLet\u2019s circle back next quarter.\u201D",
  "\u201CWe don\u2019t do last-minute reviews.\u201D",
  "\u201CTrust me, I\u2019ve done this for 20 years.\u201D",
];

function HeroExcuseTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setI((current) => (current + 1) % TICKER_LINES.length);
    }, 1750);

    return () => clearInterval(t);
  }, []);



  return (
    <span className="relative mt-5 block min-h-[3.2em] overflow-visible sm:min-h-[2.2em] md:min-h-[1.6em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={TICKER_LINES[i]}
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-0 block max-w-full font-serif italic text-[22px] leading-[1.15] sm:text-[28px] md:text-[32px] bg-gradient-to-r from-white/85 via-[#f7c8e0] to-white/50 bg-clip-text text-transparent"
        >
          {TICKER_LINES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const TABS = ["Overview", "Essays", "Schools", "Interviews", "Messages", "Parent portal"];

function HeroDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveTab((current) => (current + 1) % TABS.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const tab = TABS[activeTab];

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[32px] opacity-60 blur-3xl"
        style={{ background: "radial-gradient(50% 50% at 60% 40%, rgba(247,200,224,0.15), transparent 70%)" }}
      />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-[0_50px_120px_-20px_rgba(0,0,0,0.6)]">
        {/* top bar */}
        <div className="flex items-center justify-between border-b border-white/5 bg-[#0a0a0a] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="ml-3 font-mono text-[10px] text-white/40">primrose · sofia's application</span>
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="flex items-center gap-1.5 font-mono text-[10px] text-white/50"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#f7c8e0]" /> live
          </motion.div>
        </div>

        <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[180px_1fr]">
          {/* sidebar */}
          <div className="border-r border-white/5 bg-[#0a0a0a] p-2 text-[11px] sm:p-3 sm:text-[12px]">
            {TABS.map((l, idx) => (
              <motion.div
                key={l}
                className={`mb-1 flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors ${
                  idx === activeTab ? "bg-white/[0.06] text-white" : "text-white/50"
                }`}
                animate={idx === activeTab ? { opacity: 1 } : { opacity: 0.6 }}
              >
                <motion.span
                  className="h-1.5 w-1.5 rounded-full"
                  animate={{
                    backgroundColor: idx === activeTab ? "rgba(247,200,224,0.9)" : "rgba(255,255,255,0.2)",
                    scale: idx === activeTab ? [1, 1.4, 1] : 1,
                  }}
                  transition={{ duration: 0.5 }}
                />
                {l}
              </motion.div>
            ))}
          </div>

          {/* main */}
          <div className="relative min-h-[280px] min-w-0 p-3 sm:p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <DashboardTabContent tab={tab} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* floating notif */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 1.4, duration: 0.8 }, y: { duration: 4, repeat: Infinity, delay: 2 } }}
        className="absolute -bottom-6 -left-6 hidden items-center gap-2 rounded-xl border border-white/10 bg-[#111]/90 px-3 py-2 text-[11px] text-white/80 shadow-2xl backdrop-blur md:flex"
      >
        <Bell className="h-3.5 w-3.5 text-[#f7c8e0]" />
        Stanford essay approved by Elena
      </motion.div>
    </div>
  );
}

function DashboardTabContent({ tab }: { tab: string }) {
  switch (tab) {
    case "Overview":
      return (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif text-xl leading-tight text-white">Good morning, Sofia</div>
              <div className="text-[11px] text-white/45">Fall 2026 cycle · on schedule</div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#f7c8e0] to-white/40" />
              <span className="text-[11px] text-white/70">Dr. Elena Park</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { l: "Essays", v: "6 / 9", sub: "2 in review" },
              { l: "Milestones", v: "On track", sub: "SCEA in 18d" },
              { l: "Interviews", v: "3", sub: "MIT Friday" },
            ].map((k) => (
              <div key={k.l} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">{k.l}</div>
                <div className="mt-1 font-serif text-[18px] leading-none text-white">{k.v}</div>
                <div className="mt-1 text-[10px] text-white/45">{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[1.1fr_1fr] gap-2">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="mb-2 flex items-center justify-between text-[11px] text-white/50">
                <span>This week</span>
                <span className="font-mono text-[9px] text-white/35">5 items</span>
              </div>
              {["Common App essay · final pass", "Yale supplemental draft", "MIT alumni interview prep", "Parent check-in"].map((t) => (
                <div key={t} className="flex items-center gap-2 py-1 text-[11px] text-white/70">
                  <CheckCircle2 className="h-3 w-3 text-[#f7c8e0]/70" />
                  {t}
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-white/40">
                <MessageSquare className="h-3 w-3" /> Elena · 2h ago
              </div>
              <p className="text-[11px] leading-snug text-white/75">
                Loved the second draft of your Stanford essay. The grandmother moment grounds the whole piece.
              </p>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#f7c8e0]/30 bg-[#f7c8e0]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-[#f7c8e0]">
                <Sparkles className="h-2.5 w-2.5" /> AI reviewed
              </div>
            </div>
          </div>
        </>
      );

    case "Essays":
      return (
        <>
          <div className="flex items-center justify-between">
            <div className="font-serif text-xl leading-tight text-white">Essays</div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">6 of 9 complete</span>
          </div>
          <div className="space-y-2">
            {[
              { t: "Common App personal statement", s: "Final review", w: "650 words", c: "#f7c8e0" },
              { t: "Stanford 'What matters most'", s: "AI reviewed", w: "1,050 words", c: "#f7c8e0" },
              { t: "Yale 'Why us' supplemental", s: "Draft 2", w: "320 words", c: "#b4c8ff" },
              { t: "MIT activity essay", s: "In progress", w: "180 words", c: "#b4c8ff" },
            ].map((e) => (
              <div key={e.t} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-md" style={{ background: `${e.c}18` }}>
                  <FileText className="h-3.5 w-3.5" style={{ color: e.c }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] text-white/90">{e.t}</div>
                  <div className="text-[10px] text-white/40">{e.w}</div>
                </div>
                <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] text-white/60">{e.s}</span>
              </div>
            ))}
          </div>
        </>
      );

    case "Schools":
      return (
        <>
          <div className="flex items-center justify-between">
            <div className="font-serif text-xl leading-tight text-white">Schools</div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">9 schools · 1 SCEA</span>
          </div>
          <div className="space-y-2">
            {[
              { n: "Stanford", d: "SCEA · Nov 1", p: "Essay review", col: "#f7c8e0" },
              { n: "MIT", d: "Early Action · Nov 1", p: "Interview booked", col: "#b4c8ff" },
              { n: "Yale", d: "Regular · Jan 2", p: "Supplemental draft", col: "#f7c8e0" },
              { n: "Princeton", d: "Regular · Jan 1", p: "Portfolio ready", col: "#b4c8ff" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold" style={{ background: `${s.col}15`, color: s.col }}>
                  {s.n[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-white/90">{s.n}</div>
                  <div className="text-[10px] text-white/40">{s.d}</div>
                </div>
                <span className="text-[10px] text-white/50">{s.p}</span>
              </div>
            ))}
          </div>
        </>
      );

    case "Interviews":
      return (
        <>
          <div className="flex items-center justify-between">
            <div className="font-serif text-xl leading-tight text-white">Interviews</div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">3 sessions · 1 upcoming</span>
          </div>
          <div className="space-y-2">
            {[
              { t: "MIT Alumni Interview", d: "Fri, Oct 18 · 10:00 AM", s: "Confirmed", type: "Mock" },
              { t: "Stanford Alumni Session", d: "Tue, Oct 22 · 2:00 PM", s: "Scheduled", type: "Real" },
              { t: "Yale Practice Round", d: "Last week", s: "Completed", type: "Mock" },
            ].map((i) => (
              <div key={i.t} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <Mic className="h-3.5 w-3.5 text-[#f7c8e0]/70" />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] text-white/90">{i.t}</div>
                  <div className="text-[10px] text-white/40">{i.d}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] text-white/60">{i.type}</span>
                  <span className="text-[10px] text-white/50">{i.s}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      );

    case "Messages":
      return (
        <>
          <div className="flex items-center justify-between">
            <div className="font-serif text-xl leading-tight text-white">Messages</div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">2 unread</span>
          </div>
          <div className="space-y-2">
            {[
              { from: "Dr. Elena Park", msg: "Your Common App essay is ready for the final pass. I left 3 line-level notes.", t: "2h ago", unread: true },
              { from: "Primrose AI", msg: "Sofia's milestone tracker updated: Yale supplemental due in 5 days.", t: "5h ago", unread: true },
              { from: "MIT Alumni Network", msg: "Interview confirmed for Friday. Please review the prep guide.", t: "1d ago", unread: false },
            ].map((m) => (
              <div key={m.from} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-2.5">
                <div className={`mt-0.5 h-2 w-2 rounded-full ${m.unread ? "bg-[#f7c8e0]" : "bg-white/20"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/90">{m.from}</span>
                    <span className="text-[9px] text-white/30">{m.t}</span>
                  </div>
                  <div className="mt-0.5 text-[10px] leading-snug text-white/50">{m.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      );

    case "Parent portal":
      return (
        <>
          <div className="flex items-center justify-between">
            <div className="font-serif text-xl leading-tight text-white">Parent Portal</div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Shared view</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">Next milestone</div>
              <div className="mt-1 font-serif text-[16px] text-white">Stanford SCEA</div>
              <div className="text-[10px] text-white/45">Due in 18 days · essays in review</div>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
              <div className="font-mono text-[9px] uppercase tracking-widest text-white/40">Strategist</div>
              <div className="mt-1 font-serif text-[16px] text-white">Dr. Elena Park</div>
              <div className="text-[10px] text-white/45">Last check-in: yesterday</div>
            </div>
          </div>
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-white/40">This month</div>
            {["4 essay drafts reviewed", "2 interview prep sessions completed", "School list finalized (9 schools)", "Parent check-in shared"].map((item) => (
              <div key={item} className="flex items-center gap-2 py-1 text-[11px] text-white/70">
                <CheckCircle2 className="h-3 w-3 text-[#f7c8e0]/70" />
                {item}
              </div>
            ))}
          </div>
        </>
      );

    default:
      return null;
  }
}

export function HeroV5() {
  return (
    <section className="relative overflow-hidden">
      {/* soft pink glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 40% at 85% 20%, rgba(247,200,224,0.10), transparent 60%), radial-gradient(50% 40% at 10% 90%, rgba(180,200,255,0.05), transparent 60%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-16 md:pb-32 md:pt-24">
        <div className="flex flex-col justify-center">
          <FadeIn>
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 md:mb-8 md:tracking-[0.24em]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f7c8e0]" />
              Admissions Intelligence Platform
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="font-serif text-[40px] leading-[1.02] text-white sm:text-[60px] lg:text-[76px] xl:text-[86px]">
              <span className="block">Admissions changed.</span>
              <span className="block text-white/70">Admissions consultants didn't.</span>
            </h1>
            <HeroExcuseTicker />
          </FadeIn>

          <FadeIn delay={0.25}>
            <p className="mt-9 max-w-md text-[15px] leading-relaxed text-white/60">
              Primrose isn't a better consultancy. It's the operating system that
              replaces one. Built with former Deans of Admissions and trained on
              7,500 successful applications.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href="/login"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-[#f7c8e0]"
              >
                Start your application
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#pricing"
                className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
              >
                See pricing →
              </a>
            </div>
            <p className="mt-3 text-[11px] text-white/35">
              No setup fees. Cancel anytime.
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.2} y={30} blur={12} className="min-w-0">
          <HeroDashboard />
          <div className="mt-6 text-center md:text-left">
            <a
              href="#os"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 underline-offset-4 transition-colors hover:text-[#f7c8e0] hover:underline"
            >
              See the full experience <span aria-hidden>→</span>
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
