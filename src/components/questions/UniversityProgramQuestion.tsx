
import React from 'react';
import { SelectQuestionInput } from "./SelectQuestion";
import { TextQuestionInput } from "./TextQuestion";

interface UniversityProgramQuestionProps {
  question: {
    subQuestions: any[];
  };
  value: {
    university?: string;
    program?: string;
  };
  onChange: (value: any) => void;
}

export const UniversityProgramQuestion: React.FC<UniversityProgramQuestionProps> = ({
  question,
  value,
  onChange
}) => {
  const handleUniversityChange = (university: string) => {
    onChange({
      ...value,
      university: university
    });
  };

  const handleProgramChange = (program: string) => {
    onChange({
      ...value,
      program: program
    });
  };

  const universityQuestion = question.subQuestions.find(q => q.id === 'university');
  const programQuestion = question.subQuestions.find(q => q.id === 'program');

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">{universityQuestion.question}</h3>
        <SelectQuestionInput 
          question={universityQuestion} 
          value={value?.university || ''} 
          onChange={handleUniversityChange} 
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">{programQuestion.question}</h3>
        <TextQuestionInput 
          question={programQuestion} 
          value={value?.program || ''} 
          onChange={handleProgramChange} 
        />
      </div>
    </div>
  );
};
