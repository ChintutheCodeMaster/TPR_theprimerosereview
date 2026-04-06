
import React from 'react';
import { AgeCardQuestion } from "./AgeCardQuestion";
import { GenderCardQuestion } from "./GenderCardQuestion";

interface CombinedCardsQuestionProps {
  question: {
    subQuestions: any[];
  };
  value: {
    age_range?: string;
    gender?: string;
  };
  onChange: (value: any) => void;
}

export const CombinedCardsQuestion: React.FC<CombinedCardsQuestionProps> = ({
  question,
  value,
  onChange
}) => {
  const handleAgeChange = (ageRange: string) => {
    onChange({
      ...value,
      age_range: ageRange
    });
  };

  const handleGenderChange = (gender: string) => {
    onChange({
      ...value,
      gender: gender
    });
  };

  const ageQuestion = question.subQuestions.find(q => q.id === 'age_range');
  const genderQuestion = question.subQuestions.find(q => q.id === 'gender');

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">{ageQuestion.question}</h3>
        <AgeCardQuestion 
          question={ageQuestion} 
          value={value?.age_range || ''} 
          onChange={handleAgeChange} 
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">{genderQuestion.question}</h3>
        <GenderCardQuestion 
          question={genderQuestion} 
          value={value?.gender || ''} 
          onChange={handleGenderChange} 
        />
      </div>
    </div>
  );
};
