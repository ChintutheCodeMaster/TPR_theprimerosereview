
import React from "react";
import { GraduationCap } from "lucide-react";

interface InterviewHeaderProps {
  status: "idle" | "preparing" | "interviewing" | "feedback" | "question-feedback" | "detailed-feedback" | "final-feedback";
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({ status }) => {
  return (
    <h1 className="text-3xl font-bold mb-8 text-red-900 font-serif flex items-center">
      <GraduationCap className="mr-2 h-8 w-8" />
      Harvard Admissions Interview Simulator
      {status === "interviewing" && (
        <span className="ml-3 text-sm px-3 py-1 rounded-full bg-red-100 text-red-700 animate-pulse">
          Live Session
        </span>
      )}
    </h1>
  );
};

export default InterviewHeader;
