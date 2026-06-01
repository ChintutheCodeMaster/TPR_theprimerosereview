
import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, RotateCcw, BookOpen, Heart } from "lucide-react";
import { ConversationTurn } from "@/hooks/useRealtimeInterview";

interface FinalFeedbackProps {
  university: string;
  programName: string;
  conversationHistory: ConversationTurn[];
  onReset: () => void;
}

const profileAreas = [
  { label: "Academic interests & passions", icon: "📚" },
  { label: "Extracurricular activities & achievements", icon: "🏆" },
  { label: "Personal challenges & growth", icon: "💪" },
  { label: "Goals & future aspirations", icon: "🎯" },
  { label: "Motivations & values", icon: "✨" },
];

const FinalFeedback: React.FC<FinalFeedbackProps> = ({ university, programName, conversationHistory, onReset }) => {
  const studentTurns = conversationHistory.filter(t => t.role === "student");
  const hasConversation = studentTurns.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      {/* Celebration banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/80 via-primary to-blue-600 p-8 text-white mb-6 shadow-lg shadow-primary/20 text-center">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 -ml-8 -mb-8" />
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Great conversation, {university ? `future ${university} student` : "future student"}!</h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-lg mx-auto">
            Eva loved getting to know you. Your story, experiences, and goals give us a strong foundation
            to support you throughout your admissions journey.
          </p>
        </div>
      </div>

      {/* What Eva learned */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-slate-800">What Eva learned about you</h3>
        </div>

        <p className="text-sm text-slate-500 mb-5 leading-relaxed">
          Through your conversation, Eva built a picture of who you are — not just as an applicant, but as a person.
          {programName && university && (
            <> Your interest in <span className="font-medium text-slate-700">{programName}</span> at <span className="font-medium text-slate-700">{university}</span> gives us a great starting point.</>
          )}
        </p>

        <div className="space-y-2">
          {profileAreas.map((area, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-lg">{area.icon}</span>
              <div className="flex items-center gap-2 flex-1">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-sm text-slate-600">{area.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What happens next */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-slate-800">How this helps you</h3>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
          This profile information will be used across The Primrose Review to make every interaction more personal and relevant to your journey:
        </p>
        <div className="space-y-3">
          {[
            { icon: <BookOpen className="h-4 w-4 text-primary/70" />, text: "Essay feedback will be tailored to your experiences and voice" },
            { icon: <Sparkles className="h-4 w-4 text-primary/70" />, text: "Recommendation letter guidance will reflect your actual achievements" },
            { icon: <CheckCircle className="h-4 w-4 text-primary/70" />, text: "Application coaching will align with your specific goals and motivations" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <p className="text-sm text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onReset}
          className="border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Start Over
        </Button>
        <Button onClick={onReset}>
          Continue to Dashboard
        </Button>
      </div>
    </motion.div>
  );
};

export default FinalFeedback;
