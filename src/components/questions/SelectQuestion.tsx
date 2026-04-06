
import React from 'react';
import { SelectQuestion, SelectOption } from '@/types/onboarding';
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectQuestionProps {
  question: SelectQuestion;
  value: any;
  onChange: (value: any) => void;
}

export const SelectQuestionInput: React.FC<SelectQuestionProps> = ({ question, value, onChange }) => {
  const renderBadge = () => {
    if (value && typeof value === 'string' && value.length > 0) {
      return (
        <Badge variant="outline" className="ml-2 animate-fade-in">
          <Star className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    return null;
  };

  const renderOption = (option: string | SelectOption) => {
    if (typeof option === 'string') {
      return (
        <SelectItem 
          key={option} 
          value={option} 
          className="cursor-pointer hover:bg-neutral-100 py-3 text-base"
        >
          {option}
        </SelectItem>
      );
    } else {
      return (
        <SelectItem 
          key={option.value} 
          value={option.value} 
          className="cursor-pointer hover:bg-neutral-100 py-3 text-base"
        >
          <span className="flex items-center">
            {option.icon && <span className="mr-2">{option.icon}</span>}
            {option.value}
          </span>
        </SelectItem>
      );
    }
  };

  return (
    <div className="space-y-2">
      <Select onValueChange={onChange} value={value || ''}>
        <SelectTrigger className="w-full h-12 text-base">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent className="max-h-[40vh]">
          {question.options.map(option => renderOption(option))}
        </SelectContent>
      </Select>
      {renderBadge()}
    </div>
  );
};
