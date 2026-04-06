
import React, { useState } from 'react';
import { TextQuestion } from '@/types/onboarding';
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface TextQuestionProps {
  question: TextQuestion;
  value: any;
  onChange: (value: any) => void;
}

export const TextQuestionInput: React.FC<TextQuestionProps> = ({ 
  question, 
  value, 
  onChange,
}) => {
  const [hasFocused, setHasFocused] = useState(false);

  const handleInputFocus = () => {
    if (!hasFocused) {
      setHasFocused(true);
    }
  };

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

  // Fix for handling spaces in multi-line text inputs
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Fix for handling spaces in single-line text inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if ('maxLength' in question) {
    return (
      <div className="space-y-2">
        <Textarea
          className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 text-base min-h-[96px]"
          placeholder={question.placeholder}
          maxLength={question.maxLength}
          value={value || ''}
          onChange={handleTextareaChange}
        />
        {renderBadge()}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder={question.placeholder}
        value={value || ''}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        className="h-12 text-base transition-all duration-300"
      />
      {renderBadge()}
    </div>
  );
};
