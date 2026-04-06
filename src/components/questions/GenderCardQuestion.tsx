
import React from 'react';
import { GenderCardsQuestion } from '@/types/onboarding';
import { UserRound } from 'lucide-react';

interface GenderCardQuestionProps {
  question: GenderCardsQuestion;
  value: string;
  onChange: (value: string) => void;
}

export const GenderCardQuestion: React.FC<GenderCardQuestionProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
      {question.options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            flex flex-col items-center p-6 rounded-xl transition-all duration-300
            ${
              value === option.value
                ? 'bg-primary text-white scale-105 shadow-lg'
                : 'bg-white border-2 border-neutral-200 hover:border-primary hover:shadow-md'
            }
          `}
        >
          <div className="mb-4">
            <UserRound className="w-8 h-8" />
          </div>
          <div className="text-center">
            <div className="font-medium mb-2">{option.value}</div>
          </div>
          <div className="mt-2">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${value === option.value ? 'border-white' : 'border-neutral-300'}`}>
              {value === option.value && (
                <div className="w-3 h-3 rounded-full bg-white" />
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
