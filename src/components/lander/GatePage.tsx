import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PrimroseLogoBadge } from "@/components/lander/PrimroseLogo";

const pink = "#f7c8e0";

function ReflectionText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`relative isolate inline-block ${className ?? ""}`}>
      <span className="relative z-10 block">{text}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-full block w-full origin-top"
        style={{ transform: "scaleY(-1)" }}
      >
        <span
          className="block"
          style={{
            maskImage: "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, transparent 70%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, transparent 70%)",
          }}
        >
          {text}
        </span>
      </span>
    </span>
  );
}

export function GatePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] text-white antialiased selection:bg-[#f7c8e0]/30">
      {/* Ambient glow — slow-breathing */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 40%, rgba(247,200,224,0.09), transparent 70%), radial-gradient(40% 40% at 15% 85%, rgba(180,200,255,0.05), transparent 60%)",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle dot grid — techy texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top-right wordmark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 2.2 }}
        className="absolute right-6 top-6 hidden items-center gap-2 md:flex"
      >
        <PrimroseLogoBadge size={24} variant="dark" />
        <span className="font-serif text-sm tracking-tight text-white/70">
          Primrose
        </span>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        {/* Headline — cinematic dissolve in */}
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(20px)", scale: 0.98 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-serif text-[46px] leading-[0.95] tracking-[-0.025em] sm:text-[72px] md:text-[96px] lg:text-[118px] xl:text-[136px]">
            <span className="block">Admissions changed.</span>
            <ReflectionText
              text="Consulting"
              className="block text-white/25"
            />
            <span className="block italic" style={{ color: pink }}>
              didn&apos;t.
            </span>
          </h1>
        </motion.div>

        {/* Subheadline — staggered dissolve */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-10 max-w-lg text-balance text-[17px] leading-[1.55] text-white/45 md:text-lg"
        >
          AI laid the foundation.{" "}
          <span className="font-medium text-white/90">We built the operating system.</span>
        </motion.p>

        {/* CTA — final dissolve */}
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.1, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12"
        >
          <Link
            to="/v5"
            className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-medium text-black transition-all hover:bg-[#f7c8e0] hover:shadow-[0_0_40px_-10px_rgba(247,200,224,0.35)]"
          >
            Start your application
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>

      {/* Bottom micro-line — last to appear */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, delay: 1.8 }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f7c8e0]" />
          Admissions Intelligence Platform
        </span>
      </motion.div>
    </div>
  );
}
