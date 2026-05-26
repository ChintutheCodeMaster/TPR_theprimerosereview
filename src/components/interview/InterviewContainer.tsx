
import React from "react";
import EvaInterviewerSide from "./EvaInterviewerSide";
import UserResponseSide from "./UserResponseSide";

interface InterviewContainerProps {
  currentQuestion: string;
  isSpeaking: boolean;
  audioEnabled: boolean;
  toggleAudio: () => void;
  speakCurrentQuestion: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  isListening: boolean;
  toggleListening: () => void;
  displayedTranscript: string;
  completedAnswer: string;
  resetInterview: () => void;
  submitResponse: () => void;
  autoRecording: boolean;
  setAutoRecording: (auto: boolean) => void;
  fadeIn: boolean;
}

const InterviewContainer: React.FC<InterviewContainerProps> = ({
  currentQuestion,
  isSpeaking,
  audioEnabled,
  toggleAudio,
  speakCurrentQuestion,
  currentQuestionIndex,
  totalQuestions,
  isListening,
  toggleListening,
  displayedTranscript,
  completedAnswer,
  resetInterview,
  submitResponse,
  autoRecording,
  setAutoRecording,
  fadeIn
}) => {
  return (
    <div
      className={`max-w-5xl mx-auto backdrop-blur-lg bg-white/80 p-6 md:p-8 rounded-2xl shadow-xl border border-red-200 transition-all duration-700 ${fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[650px]">
        <EvaInterviewerSide
          currentQuestion={currentQuestion}
          isSpeaking={isSpeaking}
          audioEnabled={audioEnabled}
          toggleAudio={toggleAudio}
          speakCurrentQuestion={speakCurrentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
        />

        <UserResponseSide
          isListening={isListening}
          toggleListening={toggleListening}
          displayedTranscript={displayedTranscript}
          completedAnswer={completedAnswer}
          resetInterview={resetInterview}
          submitResponse={submitResponse}
          autoRecording={autoRecording}
          setAutoRecording={setAutoRecording}
        />
      </div>

      <div className="mt-6 flex flex-col items-center space-y-2">
        <p className={`text-sm text-red-800 font-serif transition-opacity duration-300 ${isListening ? 'opacity-100' : 'opacity-70'} text-center max-w-2xl`}>
          {isListening
            ? "Recording in progress... We'll automatically stop when you finish speaking."
            : autoRecording
            ? "Recording will start automatically after the interviewer finishes speaking."
            : "Click 'Record' to begin your response."
          }
        </p>
        <p className="text-sm text-neutral-500 font-serif">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>
      </div>
    </div>
  );
};

export default InterviewContainer;
