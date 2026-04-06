import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Sparkles, CreditCard, GraduationCap, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const isMobile = useIsMobile();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-blue-50 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="text-center space-y-3 sm:space-y-4">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 mb-2 text-xs sm:text-sm font-medium bg-blue-50 text-primary rounded-full shadow-sm">
            <Star className="w-3 sm:w-4 h-3 sm:h-4 text-amber-500" />
            <span>Your Dream School Journey Begins Here</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-midnight-800 leading-tight">
            Craft Your <span className="text-primary">Perfect</span> Personal Statement
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-xl text-neutral-600 leading-relaxed px-2 sm:px-4 md:px-8">
            We're about to help you tell your unique story in a way that makes admissions officers take notice. Ready to stand out?
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
          className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4 sm:gap-6 py-6 sm:py-8`}>
          <div className="flex flex-col items-center text-center p-4 sm:p-6 rounded-xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <Clock className="w-6 sm:w-8 h-6 sm:h-8 text-primary mb-2 sm:mb-3" />
            <h3 className="font-medium text-neutral-900 text-base sm:text-lg mb-2">15-Minute Process</h3>
            <p className="text-neutral-600 text-sm sm:text-base">Answer thoughtfully crafted questions designed to highlight your strengths and unique qualities</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 sm:p-6 rounded-xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-primary mb-2 sm:mb-3" />
            <h3 className="font-medium text-neutral-900 text-base sm:text-lg mb-2">AI-Crafted Excellence</h3>
            <p className="text-neutral-600 text-sm sm:text-base">Get a personalized draft that captures your voice while impressing admission committees</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 sm:p-6 rounded-xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-primary mb-2 sm:mb-3" />
            <h3 className="font-medium text-neutral-900 text-base sm:text-lg mb-2">100% Your Story</h3>
            <p className="text-neutral-600 text-sm sm:text-base">Your experiences and aspirations take center stage, with every detail handled securely</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-12 sm:w-16 h-0.5 bg-neutral-200"></div>
            <div className="px-3 sm:px-4 text-neutral-600 flex items-center">
              <GraduationCap className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              <span className="font-medium text-sm sm:text-base">Your Future Awaits</span>
            </div>
            <div className="w-12 sm:w-16 h-0.5 bg-neutral-200"></div>
          </div>
          <p className="text-neutral-600 max-w-lg mx-auto text-sm sm:text-base px-4">
            After completing this process, you'll receive a powerful first draft that captures your unique journey. Ready to take the next step toward your dream school?
          </p>
          <div className="bg-blue-50 p-4 sm:p-5 rounded-xl border border-blue-100 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
              <h4 className="font-medium text-neutral-900 text-sm sm:text-base">One-Time Investment</h4>
            </div>
            <p className="text-neutral-600 text-xs sm:text-sm">
              Unlock your personalized statement for just <span className="font-semibold">$29</span>, complete with advanced editing tools to perfect your application.
            </p>
          </div>
          <Button onClick={onStart} className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-primary hover:bg-primary/90 group w-full sm:w-auto">
            Begin Your Journey
            <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
