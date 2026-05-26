
import React from "react";
import { Volume2, VolumeX, Play, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedText } from "./AnimatedText";
import LiveMicrophone from "./LiveMicrophone";

interface EvaInterviewerSideProps {
  currentQuestion: string;
  isSpeaking: boolean;
  audioEnabled: boolean;
  toggleAudio: () => void;
  speakCurrentQuestion: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const EvaInterviewerSide: React.FC<EvaInterviewerSideProps> = ({
  currentQuestion,
  isSpeaking,
  audioEnabled,
  toggleAudio,
  speakCurrentQuestion,
  currentQuestionIndex,
  totalQuestions,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-red-800" />
          <h2 className="text-xl font-serif font-semibold text-red-900">
            Harvard Admissions Question {currentQuestionIndex + 1}/{totalQuestions}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAudio}
          title={audioEnabled ? "Mute interviewer" : "Unmute interviewer"}
          className="h-8 w-8 p-0 rounded-full hover:bg-red-50 transition-all"
        >
          {audioEnabled ? (
            <Volume2 className="h-4 w-4 text-red-800" />
          ) : (
            <VolumeX className="h-4 w-4 text-neutral-500" />
          )}
        </Button>
      </div>

      <div className="flex-1 relative p-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border-2 border-red-200 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-center mb-6">
          <LiveMicrophone
            isActive={isSpeaking}
            size="lg"
            altText="Harvard Interviewer"
          />
        </div>

        <div className="mt-6 bg-white p-5 rounded-lg border border-red-200 shadow-sm">
          <AnimatedText
            text={currentQuestion}
            className="text-lg text-red-900 leading-relaxed font-serif"
          />

          {!isSpeaking && audioEnabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={speakCurrentQuestion}
              className="mt-4 h-8 text-red-800 hover:bg-red-50 transition-all font-serif"
            >
              <Play className="h-3 w-3 mr-2" />
              Replay question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaInterviewerSide;
