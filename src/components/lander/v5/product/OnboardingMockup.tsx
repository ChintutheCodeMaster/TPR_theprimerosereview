import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

type Turn = { from: "ai" | "you"; text: string };

// Placeholder transcript — swap with real intake samples when ready.
const SCRIPT: Turn[] = [
  { from: "ai", text: "Before we talk schools, tell me about a class that changed how you think." },
  { from: "you", text: "AP Bio, junior year. We designed our own experiment on soil microbes." },
  { from: "ai", text: "What did you keep thinking about after the project ended?" },
  { from: "you", text: "Whether the same approach could work on urban rooftop farms in Queens." },
  { from: "ai", text: "That's a real thread. Have you tried anything with it outside school?" },
  { from: "you", text: "I started a small pilot on our building's roof this summer." },
];

export function OnboardingMockup() {
  const [visible, setVisible] = useState(2);
  const [progress, setProgress] = useState(24);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible((v) => (v >= SCRIPT.length ? 2 : v + 1));
      setProgress((p) => (p >= 92 ? 24 : p + 14));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      data-placeholder="onboarding"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 shadow-[0_40px_120px_-40px_rgba(247,200,224,0.15)] sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#f7c8e0]" />
          <span className="text-xs uppercase tracking-[0.18em] text-white/50">
            Intake · Session 01
          </span>
        </div>
        <span className="font-mono text-[10px] text-white/40">private</span>
      </div>

      {/* Chat */}
      <div className="mt-5 space-y-3 min-h-[320px]">
        <AnimatePresence initial={false}>
          {SCRIPT.slice(0, visible).map((turn, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={turn.from === "ai" ? "flex justify-start" : "flex justify-end"}
            >
              <div
                className={
                  turn.from === "ai"
                    ? "max-w-[85%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/85"
                    : "max-w-[85%] rounded-2xl rounded-tr-sm bg-[#f7c8e0]/15 px-4 py-2.5 text-sm text-white/90 border border-[#f7c8e0]/20"
                }
              >
                {turn.from === "ai" && (
                  <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40">
                    <Sparkles className="h-3 w-3" /> Primrose
                  </div>
                )}
                {turn.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Profile builder */}
      <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span className="uppercase tracking-[0.18em]">Profile building</span>
          <span className="font-mono text-white/50">{progress}%</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#f7c8e0] to-white/80"
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#f7c8e0]" />
          Your strategist has reviewed this session.
        </div>
      </div>
    </div>
  );
}
