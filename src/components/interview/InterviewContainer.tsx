
import React from "react";
import EvaInterviewerSide from "./EvaInterviewerSide";
import UserResponseSide from "./UserResponseSide";

interface InterviewContainerProps {
  isEvaSpeaking: boolean;
  isStudentSpeaking: boolean;
  evaTranscript: string;
  lastEvaUtterance: string;
  studentTranscript: string;
  isConnected: boolean;
  connectionState: string;
  endInterview: () => void;
  university?: string;
}

const InterviewContainer: React.FC<InterviewContainerProps> = ({
  isEvaSpeaking,
  isStudentSpeaking,
  evaTranscript,
  lastEvaUtterance,
  studentTranscript,
  isConnected,
  connectionState,
  endInterview,
  university,
}) => {
  const getStatusMessage = () => {
    if (!isConnected) return "Connecting...";
    if (isEvaSpeaking) return "Eva is speaking";
    if (isStudentSpeaking) return "Eva is listening";
    return "Live session active";
  };

  const statusDotClass = isConnected
    ? isEvaSpeaking
      ? "bg-primary animate-pulse"
      : isStudentSpeaking
      ? "bg-blue-400 animate-pulse"
      : "bg-emerald-400"
    : "bg-amber-400 animate-pulse";

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[580px]">
        <EvaInterviewerSide
          isEvaSpeaking={isEvaSpeaking}
          evaTranscript={evaTranscript}
          lastEvaUtterance={lastEvaUtterance}
          university={university}
        />

        <UserResponseSide
          isStudentSpeaking={isStudentSpeaking}
          studentTranscript={studentTranscript}
          endInterview={endInterview}
        />
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${statusDotClass}`} />
          <p className="text-sm text-slate-500">{getStatusMessage()}</p>
        </div>
        <span className="text-xs text-slate-300 uppercase tracking-wide font-medium">
          {isConnected ? "Connected" : "Connecting"}
        </span>
      </div>
    </div>
  );
};

export default InterviewContainer;
