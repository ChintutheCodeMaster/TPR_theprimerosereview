
import React from 'react';
import { Input } from "@/components/ui/input";
import { Trophy } from "lucide-react";
import { CVQuestion } from '@/types/onboarding';

interface CVQuestionProps {
  question: CVQuestion;
  value: any;
  onChange: (value: any) => void;
}

export const CVQuestionInput: React.FC<CVQuestionProps> = ({ question, value, onChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
        return;
      }
      onChange({ ...value, file });
    }
  };

  const handleLinkedInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const linkedin = e.target.value;
    onChange({ ...value, linkedin });
  };

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder={question.placeholder}
        value={value?.linkedin || ''}
        onChange={handleLinkedInChange}
        className="mb-2"
      />
      <div className="flex items-center gap-4 flex-col sm:flex-row">
        <Input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="flex-1"
        />
        {value?.file && (
          <p className="text-sm text-green-600 flex items-center animate-fade-in">
            <Trophy className="w-4 h-4 mr-1" />
            {value.file.name}
          </p>
        )}
      </div>
    </div>
  );
};
