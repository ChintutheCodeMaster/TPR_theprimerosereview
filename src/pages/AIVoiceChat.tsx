
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AIVoiceChat = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);
  const animationRef = useRef<number>();

  useEffect(() => {
    let time = 0;
    const animate = () => {
      time += 0.05;
      if (isSpeaking) {
        setPulseScale(1 + Math.sin(time * 3) * 0.15 + Math.sin(time * 7) * 0.05);
      } else if (isListening) {
        setPulseScale(1 + Math.sin(time * 2) * 0.08);
      } else {
        setPulseScale(1 + Math.sin(time) * 0.03);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSpeaking, isListening]);

  useEffect(() => {
    if (isListening) {
      const timer = setTimeout(() => {
        setIsListening(false);
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 4000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isListening]);

  const handleMicToggle = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsSpeaking(false);
      setIsListening(true);
    }
  };

  const waveBars = Array.from({ length: 32 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <Button
        variant="ghost"
        onClick={() => navigate("/student-dashboard")}
        className="absolute top-6 left-6 text-white/60 hover:text-white hover:bg-white/10 z-20"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center z-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          AI Discovery Call
        </h1>
        <p className="text-white/50 text-sm sm:text-base">
          Let's get to know you better through a conversation
        </p>
      </motion.div>

      <div className="relative z-10 mb-16">
        <AnimatePresence>
          {(isSpeaking || isListening) && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute inset-0 rounded-full ${isSpeaking ? "bg-primary/20" : "bg-blue-400/20"}`}
                style={{ margin: "-30px" }}
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0, 0.15] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className={`absolute inset-0 rounded-full ${isSpeaking ? "bg-primary/10" : "bg-blue-400/10"}`}
                style={{ margin: "-50px" }}
              />
            </>
          )}
        </AnimatePresence>

        <motion.div
          style={{ scale: pulseScale }}
          className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br from-primary/80 via-primary to-blue-600 flex items-center justify-center shadow-2xl shadow-primary/30 relative"
        >
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />

          <AnimatePresence mode="wait">
            {isSpeaking ? (
              <motion.div
                key="speaking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-[2px]"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [12, 28 + Math.random() * 16, 12] }}
                    transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                    className="w-2 bg-white/90 rounded-full"
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Volume2 className="w-12 h-12 sm:w-14 sm:h-14 text-white/90" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="absolute bottom-32 left-0 right-0 flex items-end justify-center gap-[3px] h-16 px-8 z-10">
        {waveBars.map((i) => (
          <motion.div
            key={i}
            animate={{
              height: isListening
                ? [4, 8 + Math.random() * 40, 4]
                : isSpeaking
                ? [4, 4 + Math.random() * 20, 4]
                : [4, 6, 4],
            }}
            transition={{ duration: 0.3 + Math.random() * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
            className={`w-1.5 rounded-full ${
              isListening ? "bg-blue-400/60" : isSpeaking ? "bg-primary/50" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <motion.p
        key={isSpeaking ? "speaking" : isListening ? "listening" : "idle"}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-white/60 text-sm mb-8 z-10"
      >
        {isSpeaking ? "AI is speaking..." : isListening ? "Listening to you..." : "Tap the microphone to start"}
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMicToggle}
        className={`z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-colors duration-300 shadow-lg ${
          isListening ? "bg-red-500 shadow-red-500/30" : "bg-white/10 hover:bg-white/20 border border-white/20"
        }`}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        ) : (
          <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        )}
      </motion.button>

      <p className="text-white/30 text-xs mt-6 z-10">
        Demo mode — voice interaction preview
      </p>
    </div>
  );
};

export default AIVoiceChat;
