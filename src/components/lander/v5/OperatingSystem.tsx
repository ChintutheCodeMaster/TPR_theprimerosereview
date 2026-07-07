import { motion } from "framer-motion";
import { FadeIn, Section } from "./motion";
import { PrimroseLogo } from "@/components/lander/PrimroseLogo";

const MODULES = [
  "Essays", "Deadlines", "Interviews", "Schools", "Parents", "AI", "Messages", "Documents", "Timeline", "Recommendations",
];

export function OperatingSystem() {
  return (
    <Section id="os" eyebrow="The Operating System" className="bg-[#0a0a0a]">
      <div className="text-center">
        <FadeIn>
          <h2 className="mx-auto max-w-4xl font-serif text-[36px] leading-[1.02] tracking-tight text-white sm:text-5xl md:text-7xl">
            Everything assembles
            <br />
            into <span className="italic text-[#f7c8e0]">one system</span>.
          </h2>
        </FadeIn>
      </div>

      <FadeIn delay={0.15}>
        <div className="relative mx-auto mt-16 aspect-square w-full max-w-[440px] md:mt-24 md:max-w-2xl">
          {/* rings */}
          {[1, 2, 3].map((r) => (
            <motion.div
              key={r}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 0.5, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * r, duration: 1.2 }}
              className="absolute inset-0 m-auto rounded-full border border-white/5"
              style={{ width: `${r * 30}%`, height: `${r * 30}%` }}
            />
          ))}

          {/* connection lines + traveling packets */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <radialGradient id="os-packet" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f7c8e0" stopOpacity="1" />
                <stop offset="100%" stopColor="#f7c8e0" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="os-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f7c8e0" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#f7c8e0" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {MODULES.map((m, i) => {
              const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
              const r = 44;
              const x2 = 50 + r * Math.cos(angle);
              const y2 = 50 + r * Math.sin(angle);
              return (
                <g key={m}>
                  <motion.line
                    x1={50}
                    y1={50}
                    x2={x2}
                    y2={y2}
                    stroke="url(#os-line)"
                    strokeWidth={0.15}
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.06, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.circle
                    r={0.9}
                    fill="url(#os-packet)"
                    initial={{ cx: 50, cy: 50, opacity: 0 }}
                    whileInView={{
                      cx: [50, x2, 50],
                      cy: [50, y2, 50],
                      opacity: [0, 1, 0],
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{
                      delay: 1.4 + (i % 5) * 0.35,
                      duration: 3.2,
                      repeat: Infinity,
                      repeatDelay: 1.8,
                      ease: "easeInOut",
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* core */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 1 }}
            className="absolute left-1/2 top-1/2 z-10 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#f7c8e0]/50 bg-[#f7c8e0]/10"
            style={{ boxShadow: "0 0 120px rgba(247,200,224,0.35)" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border border-[#f7c8e0]/40"
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-[#f7c8e0]/40"
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1.5 }}
            />
            <div className="text-center">
              <PrimroseLogo size={44} color="#f7c8e0" strokeWidth={2.2} />
            </div>
          </motion.div>
          {/* modules — assemble in */}
          {MODULES.map((m, i) => {
            const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
            const r = 44; // percent
            const x = 50 + r * Math.cos(angle);
            const y = 50 + r * Math.sin(angle);
            return (
              <motion.div
                key={m}
                initial={{ opacity: 0, scale: 1.3 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + i * 0.08, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#0f0f0f] px-2 py-1 text-[9px] text-white/80 backdrop-blur sm:px-3 sm:py-1.5 sm:text-[11px]"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {m}
              </motion.div>
            );
          })}
        </div>
      </FadeIn>
    </Section>
  );
}

