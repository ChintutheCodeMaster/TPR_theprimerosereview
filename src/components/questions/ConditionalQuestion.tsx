
import React from 'react';
import { ConditionalQuestion } from '@/types/onboarding';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConditionalQuestionProps {
  question: ConditionalQuestion;
  value: any;
  onChange: (value: any) => void;
}

export const ConditionalQuestionInput: React.FC<ConditionalQuestionProps> = ({ question, value, onChange }) => {
  return (
    <div className="space-y-4">
      <Select onValueChange={(val) => onChange({ answer: val })} value={value?.answer || ''}>
        <SelectTrigger className="w-full h-12 text-base">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          {question.options.map((option) => (
            <SelectItem 
              key={option} 
              value={option}
              className="cursor-pointer hover:bg-neutral-100 py-3 text-base"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value?.answer === question.followUp.condition && (
        <textarea
          className="w-full h-24 p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-base"
          placeholder={question.followUp.placeholder}
          maxLength={question.followUp.maxLength}
          value={value?.followUp || ''}
          onChange={(e) => onChange({ 
            ...value,
            followUp: e.target.value
          })}
        />
      )}
    </div>
  );
};
