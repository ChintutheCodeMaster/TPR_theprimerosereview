
import React from 'react';
import { motion } from "framer-motion";

export const LoadingTransition = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FDE1D3] to-white p-4 sm:p-6">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="mb-12 relative">
          <motion.div initial={{ scale: 0.5, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
            <img src="/lovable-uploads/af09e6cd-81f1-49aa-8ca5-37cdab3904f9.png" alt="Celebration" className="w-64 h-64 object-contain mx-auto" />
            <motion.div animate={{ y: [-20, 20], x: [-10, 10], rotate: [-10, 10] }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} className="absolute top-0 left-1/4 w-4 h-4 bg-yellow-400 rounded-full" />
            <motion.div animate={{ y: [-15, 15], x: [10, -10], rotate: [10, -10] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: 0.2 }} className="absolute top-1/4 right-1/4 w-3 h-3 bg-blue-400 rounded-full" />
            <motion.div animate={{ y: [-25, 25], x: [15, -15], rotate: [15, -15] }} transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.4 }} className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-pink-400 rounded-star" />
          </motion.div>
        </div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-2xl sm:text-3xl font-bold text-[#1A1F2C] leading-relaxed">
          Glad you're with us!
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto leading-relaxed">
          You're embarking on an exciting journey. In just a few steps, once we get to know you, we'll generate a compelling personal statement for your application.
        </motion.p>
        <div className="flex items-center justify-center gap-3 mt-12">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
};
