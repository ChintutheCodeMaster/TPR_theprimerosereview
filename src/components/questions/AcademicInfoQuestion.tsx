
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Question } from '@/types/onboarding';
import { Textarea } from '../ui/textarea';

interface AcademicInfoQuestionProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export const AcademicInfoQuestion: React.FC<AcademicInfoQuestionProps> = ({ 
  question, 
  value = {}, 
  onChange 
}) => {
  const { subQuestions } = question as any;
  
  const handleUniversityChange = (university: string) => {
    if (university === "Other") {
      onChange({
        ...value,
        universities: university,
        otherUniversity: value.otherUniversity || ""
      });
    } else {
      onChange({
        ...value,
        universities: university,
        otherUniversity: ""
      });
    }
  };

  const handleOtherUniversityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      otherUniversity: e.target.value
    });
  };

  const handleProgramChange = (program: string) => {
    onChange({
      ...value,
      program
    });
  };

  const handleFieldChange = (field: string) => {
    onChange({
      ...value,
      field_of_study: field
    });
  };

  // Extract subquestions
  const universityQuestion = subQuestions.find((q: any) => q.id === "universities");
  const otherUniversityQuestion = subQuestions.find((q: any) => q.id === "otherUniversity");
  const programQuestion = subQuestions.find((q: any) => q.id === "program");
  const fieldQuestion = subQuestions.find((q: any) => q.id === "field_of_study");

  const showOtherUniversityInput = value.universities === "Other";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{universityQuestion.question}</label>
          <Select 
            value={value.universities || ''} 
            onValueChange={handleUniversityChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a university" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {universityQuestion.options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center">
                    <span className="mr-2">{option.icon}</span>
                    {option.value}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {showOtherUniversityInput && (
            <div className="mt-2">
              <label className="block text-sm font-medium mb-2">{otherUniversityQuestion.question}</label>
              <Input
                type="text"
                placeholder={otherUniversityQuestion.placeholder}
                value={value.otherUniversity || ''}
                onChange={handleOtherUniversityChange}
                maxLength={otherUniversityQuestion.maxLength}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{programQuestion.question}</label>
          <Select 
            value={value.program || ''} 
            onValueChange={handleProgramChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select degree level" />
            </SelectTrigger>
            <SelectContent>
              {programQuestion.options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center">
                    <span className="mr-2">{option.icon}</span>
                    {option.value}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">{fieldQuestion.question}</label>
          <Select 
            value={value.field_of_study || ''} 
            onValueChange={handleFieldChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select field of study" />
            </SelectTrigger>
            <SelectContent>
              {fieldQuestion.options.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center">
                    <span className="mr-2">{option.icon}</span>
                    {option.value}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
