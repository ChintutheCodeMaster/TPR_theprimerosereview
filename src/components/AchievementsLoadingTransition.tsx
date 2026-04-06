
import React from 'react';
import { motion } from "framer-motion";

export const AchievementsLoadingTransition = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FDE1D3] to-white p-4 sm:p-6">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="mb-12 relative">
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
            <motion.div animate={{ y: [0, -10, 0], rotate: [0, -3, 3, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}>
              <img src="/lovable-uploads/267dd38d-bdcc-4e06-a91c-54c46314264c.png" alt="Trophy" className="w-64 h-64 object-contain mx-auto" />
            </motion.div>
            <motion.div animate={{ opacity: [0.5, 1, 0.5], scale: [0.98, 1, 0.98] }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} className="absolute inset-0 bg-gradient-to-t from-[#FDE1D3]/30 to-transparent rounded-full blur-xl -z-10" />
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1F2C] leading-relaxed">Great!</h2>
          <p className="text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Did you know that 68% of applicants mention a special project or academic achievement in their personal statement? Highlighting what makes you stand out is key!
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }} className="mt-12">
          <div className="flex items-center justify-center gap-3">
            <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-pulse" />
            <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
