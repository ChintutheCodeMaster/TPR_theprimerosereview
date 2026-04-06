
import React from 'react';
import { GraduationCap, Briefcase, LineChart, Award } from 'lucide-react';

interface AgeCardQuestionProps {
  question: {
    options: Array<{
      range: string;
      icon: string;
    }>;
  };
  value: string;
  onChange: (value: string) => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'graduate':
      return <GraduationCap className="w-8 h-8" />;
    case 'professional':
      return <Briefcase className="w-8 h-8" />;
    case 'experienced':
      return <LineChart className="w-8 h-8" />;
    case 'senior':
      return <Award className="w-8 h-8" />;
    default:
      return null;
  }
};

export const AgeCardQuestion: React.FC<AgeCardQuestionProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
      {question.options.map((option) => (
        <button
          key={option.range}
          onClick={() => onChange(option.range)}
          className={`
            flex flex-col items-center p-6 rounded-xl transition-all duration-300
            ${
              value === option.range
                ? 'bg-primary text-white scale-105 shadow-lg'
                : 'bg-white border-2 border-neutral-200 hover:border-primary hover:shadow-md'
            }
          `}
        >
          <div className="mb-4">
            {getIcon(option.icon)}
          </div>
          <div className="text-center">
            <div className="font-medium mb-2">Age: {option.range}</div>
          </div>
          <div className="mt-2">
            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center
              ${value === option.range ? 'border-white' : 'border-neutral-300'}">
              {value === option.range && (
                <div className="w-3 h-3 rounded-full bg-white" />
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
