
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
// import { AnimatedText } from "./AnimatedText";

interface EvaInterviewerSideProps {
  isEvaSpeaking: boolean;
  evaTranscript: string;
  lastEvaUtterance: string;
  university?: string;
}

const EvaInterviewerSide: React.FC<EvaInterviewerSideProps> = ({
  isEvaSpeaking,
  evaTranscript: _evaTranscript,
  lastEvaUtterance: _lastEvaUtterance,
  university,
}) => {
  const [pulseScale, setPulseScale] = useState(1);
  const animationRef = useRef<number>();

  useEffect(() => {
    let time = 0;
    const animate = () => {
      time += 0.05;
      if (isEvaSpeaking) {
        setPulseScale(1 + Math.sin(time * 3) * 0.15 + Math.sin(time * 7) * 0.05);
      } else {
        setPulseScale(1 + Math.sin(time) * 0.03);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isEvaSpeaking]);

  const waveBars = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-4">
        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${isEvaSpeaking ? "bg-primary animate-pulse" : "bg-primary/50"}`} />
        <h2 className="text-base font-semibold text-slate-700">
          Eva — Your Admissions Coach
        </h2>
      </div>

      <div className="flex-1 relative p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-8">
        {/* Orb */}
        <div className="relative flex items-center justify-center w-32 h-32">
          <AnimatePresence>
            {isEvaSpeaking && (
              <>
                <motion.div
                  key="ring1"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-primary/20"
                  style={{ margin: "-28px" }}
                />
                <motion.div
                  key="ring2"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 2, 1], opacity: [0.15, 0, 0.15] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute inset-0 rounded-full bg-primary/10"
                  style={{ margin: "-52px" }}
                />
              </>
            )}
          </AnimatePresence>

          <motion.div
            style={{ scale: pulseScale }}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/80 via-primary to-blue-600 flex items-center justify-center shadow-2xl shadow-primary/25 relative z-10"
          >
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
            <AnimatePresence mode="wait">
              {isEvaSpeaking ? (
                <motion.div
                  key="speaking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-[3px]"
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, 26 + Math.random() * 10, 8] }}
                      transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                      className="w-1.5 bg-white/90 rounded-full"
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Volume2 className="w-10 h-10 text-white/90" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Wave bars */}
        <div className="flex items-end justify-center gap-[2px] h-8 w-full max-w-xs">
          {waveBars.map((i) => (
            <motion.div
              key={i}
              animate={{
                height: isEvaSpeaking ? [3, 8 + Math.random() * 20, 3] : [3, 5, 3],
              }}
              transition={{ duration: 0.3 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.04 }}
              className={`w-1 rounded-full transition-colors duration-500 ${isEvaSpeaking ? "bg-primary/50" : "bg-slate-300"}`}
            />
          ))}
        </div>

        {/* Status label */}
        <motion.p
          key={isEvaSpeaking ? "speaking" : "waiting"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-slate-500 text-center"
        >
          {isEvaSpeaking ? "Eva is speaking — listen carefully" : "Waiting for your response..."}
        </motion.p>

        {/* Transcript box — commented out for now */}
        {/*
        <div className="w-full bg-white border border-slate-200 rounded-xl p-4 min-h-[100px] flex items-start shadow-sm">
          {lastEvaUtterance ? (
            <AnimatedText
              text={lastEvaUtterance}
              className="text-sm text-slate-700 leading-relaxed"
              key={lastEvaUtterance}
            />
          ) : (
            <p className="text-xs text-slate-400 italic">Eva is getting ready to speak...</p>
          )}
        </div>
        */}
      </div>
    </div>
  );
};

export default EvaInterviewerSide;
