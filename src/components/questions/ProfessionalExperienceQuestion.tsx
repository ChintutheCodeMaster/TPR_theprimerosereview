
import React, { useState } from 'react';
import { Question, CombinedCardsQuestion, TextQuestion } from '@/types/onboarding';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfessionalExperienceQuestionProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export const ProfessionalExperienceQuestion: React.FC<ProfessionalExperienceQuestionProps> = ({ 
  question, 
  value = {}, 
  onChange 
}) => {
  const [hasFocused, setHasFocused] = useState(false);

  const handleInputChange = (fieldId: string, fieldValue: string) => {
    const newValue = {
      ...value,
      [fieldId]: fieldValue
    };
    onChange(newValue);
    if (!hasFocused) {
      setHasFocused(true);
    }
  };

  const renderBadge = (fieldId: string) => {
    if (value && value[fieldId] && typeof value[fieldId] === 'string' && value[fieldId].length > 0) {
      return (
        <Badge variant="outline" className="ml-2 animate-fade-in">
          <Star className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    return null;
  };

  // Check if all required fields are completed
  const isCompleted = value && 
    typeof value === 'object' && 
    'company' in value && 
    'position' in value && 
    'responsibilities' in value &&
    value.company && 
    value.position && 
    value.responsibilities;

  if (question.type !== 'combined_cards' || !question.subQuestions) {
    return null;
  }

  const combinedQuestion = question as CombinedCardsQuestion;

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {combinedQuestion.subQuestions.map((subQuestion) => {
              // Cast to TextQuestion to access text-specific properties
              const textSubQuestion = subQuestion as TextQuestion;
              
              return (
                <div key={subQuestion.id} className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor={subQuestion.id} className="font-medium">
                      {typeof subQuestion.question === 'function' 
                        ? subQuestion.question({}) // Default empty object if needed
                        : subQuestion.question}
                    </Label>
                    {renderBadge(subQuestion.id)}
                  </div>
                  {subQuestion.id === 'responsibilities' ? (
                    <Textarea
                      id={subQuestion.id}
                      placeholder={textSubQuestion.placeholder || ''}
                      value={value[subQuestion.id] || ''}
                      onChange={(e) => handleInputChange(subQuestion.id, e.target.value)}
                      className="w-full p-4 border rounded-lg min-h-[100px]"
                      maxLength={textSubQuestion.maxLength}
                    />
                  ) : (
                    <Input
                      id={subQuestion.id}
                      type="text"
                      placeholder={textSubQuestion.placeholder || ''}
                      value={value[subQuestion.id] || ''}
                      onChange={(e) => handleInputChange(subQuestion.id, e.target.value)}
                      className="h-12 text-base"
                      maxLength={textSubQuestion.maxLength}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {isCompleted && (
        <Badge variant="outline" className="animate-fade-in">
          <Star className="w-3 h-3 mr-1" />
          All sections completed
        </Badge>
      )}
    </div>
  );
};
