
import React, { useEffect, useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface SliderQuestionProps {
  question: {
    min: number;
    max: number;
    step: number;
    marks: Array<{ value: number; label: string }>;
  };
  value: number;
  onChange: (value: any) => void;
}

export const SliderQuestionInput: React.FC<SliderQuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  const displayValue = value === question.max ? `${value}+` : value;
  const [lastMilestone, setLastMilestone] = useState<number | null>(null);

  // Handle mark clicks
  const handleMarkClick = (markValue: number) => {
    onChange(markValue);
  };

  // Show toast notifications at 5-year milestones
  useEffect(() => {
    if (value >= 5) {
      const milestone = Math.floor(value / 5) * 5;
      
      if (milestone >= 5 && milestone !== lastMilestone) {
        const messages = {
          5: "5 years experience! You've gained valuable industry knowledge.",
          10: "10 years! You're now considered a senior professional in your field.",
          15: "15+ years! You're at expert level with deep domain expertise."
        };
        
        const message = messages[milestone as keyof typeof messages] || 
          `${milestone} years of experience is impressive!`;
        
        toast(
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">{message}</span>
          </div>,
          {
            duration: 3000,
          }
        );
        
        setLastMilestone(milestone);
      }
    }
  }, [value, lastMilestone]);

  return (
    <div className="space-y-8">
      <div className="flex justify-center mb-4">
        <Badge variant="secondary" className="text-lg px-6 py-3 shadow-sm">
          {displayValue} {displayValue === 1 ? 'year' : 'years'}
        </Badge>
      </div>

      <div className="w-full px-4">
        <Slider
          defaultValue={[value || 0]}
          max={question.max}
          min={question.min}
          step={question.step}
          onValueChange={(values) => onChange(values[0])}
          className="w-full"
          value={[value]}
          aria-label="Years of experience"
        />
      </div>
      
      <div className="flex justify-between px-4 relative mt-4">
        {question.marks.map((mark) => (
          <button 
            key={mark.value} 
            type="button"
            onClick={() => handleMarkClick(mark.value)}
            className={`flex flex-col items-center transition-colors cursor-pointer focus:outline-none ${
              Math.abs(value - mark.value) < 0.25 ? 'text-primary font-medium' : 'text-gray-600'
            }`}
          >
            <div className="h-2 w-0.5 bg-current mb-1"></div>
            <span className="text-sm font-medium">{mark.label}</span>
            <span className="text-xs mt-1">
              {mark.value === question.max ? '+ years' : 'years'}
            </span>
          </button>
        ))}
      </div>

      <p className="text-sm text-center text-gray-500 mt-6">
        <span className="inline-flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M18 6 7 17l-5-5"></path>
          </svg>
          Slide to adjust your years of experience
        </span>
        <br />
        <span className="text-xs">
          Use precise values with 0.5 year increments
        </span>
      </p>
    </div>
  );
};
