
import React from 'react';
import { motion } from "framer-motion";

const PARTICLES = [
  { color: "#f59e0b", size: 14, x: -80, y: -60, delay: 0,    duration: 2.2, shape: "circle" },
  { color: "#8b5cf6", size: 10, x:  70, y: -80, delay: 0.15, duration: 1.8, shape: "circle" },
  { color: "#ec4899", size: 18, x: -60, y:  50, delay: 0.3,  duration: 2.5, shape: "square" },
  { color: "#22c55e", size: 10, x:  90, y:  40, delay: 0.1,  duration: 2.0, shape: "circle" },
  { color: "#3b82f6", size: 12, x: -30, y:  90, delay: 0.4,  duration: 1.9, shape: "square" },
  { color: "#f97316", size:  8, x:  50, y:  80, delay: 0.25, duration: 2.3, shape: "circle" },
  { color: "#6366f1", size: 14, x: -90, y:  10, delay: 0.35, duration: 2.1, shape: "square" },
  { color: "#14b8a6", size:  9, x:  80, y: -30, delay: 0.05, duration: 1.7, shape: "circle" },
];

export const LoadingTransition = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FDE1D3] to-white p-4 sm:p-6">
      <div className="max-w-3xl mx-auto text-center space-y-8">

        {/* Gamification hero block */}
        <div className="mb-8 relative flex items-center justify-center">
          {/* Floating confetti particles */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === "circle" ? "50%" : "3px",
                left: `calc(50% + ${p.x}px)`,
                top: `calc(50% + ${p.y}px)`,
              }}
              animate={{
                y: [0, -18, 0],
                x: [0, p.x > 0 ? 8 : -8, 0],
                rotate: p.shape === "square" ? [0, 45, 0] : [0, 0, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                repeatType: "reverse",
                delay: p.delay,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Central XP/level-up badge */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative z-10"
          >
            {/* Glowing ring */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.15, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ec4899)",
                filter: "blur(18px)",
                transform: "scale(1.3)",
              }}
            />

            {/* Badge */}
            <div
              className="relative flex flex-col items-center justify-center rounded-full"
              style={{
                width: 140,
                height: 140,
                background: "linear-gradient(135deg, #f59e0b, #f97316)",
                boxShadow: "0 12px 40px rgba(245,158,11,0.45)",
              }}
            >
              <span style={{ fontSize: "3.5rem", lineHeight: 1 }}>🎉</span>
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white font-black text-sm tracking-widest mt-1"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
              >
                +50 XP
              </motion.span>
            </div>

            {/* Step complete ribbon */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                boxShadow: "0 4px 14px rgba(139,92,246,0.4)",
              }}
            >
              Step 1 Complete ✓
            </motion.div>
          </motion.div>
        </div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-[#1A1F2C] leading-relaxed pt-4"
        >
          Glad you're with us!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto leading-relaxed"
        >
          You're embarking on an exciting journey. In just a few steps, once we get to
          know you, we'll generate a compelling personal statement for your application.
        </motion.p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {[0, 0.2, 0.4].map((delay, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
