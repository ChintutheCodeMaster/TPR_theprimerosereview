import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Feather, ShieldAlert, Sparkles } from "lucide-react";

const EASE = [0.2, 0.6, 0.2, 1] as const;

const points = [
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
] as const;

const toneAccent = {
  sage: "text-[#b8c4a8]",
  pink: "text-[#f7c8e0]",
  gold: "text-[#d4b678]",
} as const;

const StudentGuide = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const serif = { fontFamily: '"Instrument Serif", ui-serif, Georgia, serif' };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden text-[#f5f1f0]"
      style={{ backgroundColor: "#0a0c1a" }}
    >
      <style>{`
        @keyframes sg-slow-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50%       { opacity: 0.6;  transform: scale(1.05); }
        }
        .sg-slow-pulse { animation: sg-slow-pulse 6s ease-in-out infinite; }
        @keyframes sg-shimmer-in {
          from { opacity: 0; transform: translateY(6px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }
      `}</style>

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Ambient blur orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 -left-32 h-80 w-80 rounded-full blur-3xl sg-slow-pulse z-0"
        style={{ backgroundColor: "rgba(247, 200, 224, 0.18)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-16 -right-24 h-96 w-96 rounded-full blur-3xl sg-slow-pulse z-0"
        style={{ backgroundColor: "rgba(184, 196, 168, 0.14)", animationDelay: "-2s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full blur-3xl sg-slow-pulse z-0"
        style={{ backgroundColor: "rgba(212, 182, 120, 0.10)", animationDelay: "-4s" }}
      />

      <motion.main
        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative z-10 mx-auto max-w-[1100px] px-6 md:px-14 py-16 md:py-24"
      >
        {/* Eyebrow rule */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          className="flex items-center gap-4 mb-8"
        >
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/60">
            Before we begin
          </span>
          <span
            aria-hidden
            className="h-px flex-1"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.18), transparent)",
            }}
          />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          style={{
            ...serif,
            fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.025em",
          }}
          className="max-w-4xl text-white"
        >
          A quick word about how we work here.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-white/65"
        >
          Primrose is built to sit beside you while you write — not to write in your place.
          Three things to know before you go in.
        </motion.p>

        {/* Cards */}
        <div className="mt-12 md:mt-16 grid gap-5 md:gap-6">
          {points.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, ease: EASE, delay: 0.3 + i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 p-6 md:p-8"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                }}
              >
                {/* Card glow accent */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-60"
                  style={{
                    backgroundColor:
                      p.tone === "sage"
                        ? "rgba(184,196,168,0.25)"
                        : p.tone === "pink"
                        ? "rgba(247,200,224,0.28)"
                        : "rgba(212,182,120,0.22)",
                  }}
                />

                <div className="relative flex items-start gap-5">
                  <div
                    className="shrink-0 rounded-xl border border-white/10 p-2.5"
                    style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  >
                    <Icon className={`h-5 w-5 ${toneAccent[p.tone]}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/50 mb-3">
                      {p.eyebrow}
                    </div>
                    <h2
                      style={{ ...serif, letterSpacing: "-0.01em" }}
                      className="text-2xl md:text-[28px] leading-tight text-white"
                    >
                      {p.title}
                    </h2>
                    <p className="mt-3 text-[15px] md:text-base leading-relaxed text-white/70">
                      {p.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footnote quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.65 }}
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
          <p
            style={serif}
            className="italic text-white/55 text-lg md:text-xl leading-snug"
          >
            "The essay that gets read twice is the one that sounds like you — nobody else."
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.75 }}
          className="mt-12 md:mt-14 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <button
            onClick={() => navigate("/student-dashboard")}
            className="group inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/25 px-6 py-3.5 text-sm font-medium text-white transition-all"
          >
            I understand. Take me in.
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <span className="text-xs text-white/40">
            You can revisit this from your dashboard anytime.
          </span>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default StudentGuide;
