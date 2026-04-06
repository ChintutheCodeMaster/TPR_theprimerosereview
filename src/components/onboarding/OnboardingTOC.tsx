
import React from "react";
import { BookOpen, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface OnboardingTOCProps {
  steps: Array<{
    title: string;
    description?: string;
    locked?: boolean;
  }>;
  currentStep: number;
  onNavigateToStep?: (index: number) => void;
}

const OnboardingTOC: React.FC<OnboardingTOCProps> = ({ steps, currentStep, onNavigateToStep }) => {
  const isMobile = useIsMobile();

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-3 sm:p-4">
      <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
        <BookOpen className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
        Your Journey
      </h2>
      <div className="space-y-1 sm:space-y-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLocked = step.locked;

          const getShortDescription = (title: string) => {
            switch (title) {
              case "Basic Information": return "Your profile details";
              case "Your Personal Story": return "Defining moments";
              case "Whose journey, achievements, and values inspire you the most?": return "Role models & influences";
              case "Your Unique Strengths": return "Key qualities & skills";
              case "Quick Start": return "Academic background";
              case "Your Professional Background": return "Work experience";
              case "Your Goals": return "Future aspirations";
              default: return "";
            }
          };

          return (
            <button
              key={index}
              onClick={() => { if (!isLocked && onNavigateToStep) onNavigateToStep(index); }}
              disabled={isLocked}
              className={cn(
                "w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-md flex items-center justify-between gap-2 transition-colors",
                isActive ? "bg-blue-50 border-l-4 border-blue-600"
                  : isCompleted ? "hover:bg-gray-50 text-gray-700"
                  : isLocked ? "text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-50 text-gray-700"
              )}
            >
              <div className="flex flex-col">
                <div className="flex items-center">
                  <div className={cn(
                    "w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center mr-2 sm:mr-3",
                    isActive ? "bg-blue-600 text-white"
                      : isCompleted ? "bg-green-500 text-white"
                      : isLocked ? "bg-gray-200 text-gray-400"
                      : "bg-gray-200 text-gray-600"
                  )}>
                    {isCompleted ? <Check className="w-3 sm:w-4 h-3 sm:h-4" />
                      : isLocked ? <Lock className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                      : <span className="text-xs sm:text-xs">{index + 1}</span>}
                  </div>
                  <span className={cn("text-sm sm:text-base", isLocked ? "text-gray-400" : "")}>
                    {isMobile && step.title.length > 20 ? `${step.title.substring(0, 20)}...` : step.title}
                  </span>
                </div>
                {getShortDescription(step.title) && !isMobile && (
                  <span className="text-xs text-gray-500 ml-8 sm:ml-9">{getShortDescription(step.title)}</span>
                )}
              </div>
              {isLocked && <Lock className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingTOC;
