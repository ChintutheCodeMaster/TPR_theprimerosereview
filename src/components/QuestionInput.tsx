
import React from 'react';
import { TextQuestionInput } from "./questions/TextQuestion";
import { SelectQuestionInput } from "./questions/SelectQuestion";
import { MultipleQuestionInput } from "./questions/MultipleQuestion";
import { ConditionalQuestionInput } from "./questions/ConditionalQuestion";
import { CVQuestionInput } from "./questions/CVQuestion";
import { AgeCardQuestion } from "./questions/AgeCardQuestion";
import { GenderCardQuestion } from "./questions/GenderCardQuestion";
import { CombinedCardsQuestion } from "./questions/CombinedCardsQuestion";
import { InspirationalFiguresGrid } from "./questions/InspirationalFiguresGrid";
import { SliderQuestionInput } from "./questions/SliderQuestion";
import { AcademicInfoQuestion } from "./questions/AcademicInfoQuestion";
import { ProfessionalExperienceQuestion } from "./questions/ProfessionalExperienceQuestion";
import { VisionBoardQuestionInput } from "./questions/VisionBoardQuestion";
import { UniversityProgramQuestion } from "./questions/UniversityProgramQuestion";
import { Question, MultipleQuestion } from "@/types/onboarding";

interface QuestionInputProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export const QuestionInput: React.FC<QuestionInputProps> = ({ question, value, onChange }) => {
  const [hasInteracted, setHasInteracted] = React.useState(false);

  if (question.id === "inspirational_figures" && question.type === "multiple") {
    return (
      <InspirationalFiguresGrid
        question={question as MultipleQuestion}
        value={value}
        onChange={onChange}
        hasInteracted={hasInteracted}
        setHasInteracted={setHasInteracted}
      />
    );
  }

  if (question.id === "academic_info" && question.type === "combined_cards") {
    return <AcademicInfoQuestion question={question} value={value} onChange={onChange} />;
  }

  if (question.id === "university_program_info" && question.type === "combined_cards") {
    return <UniversityProgramQuestion question={question} value={value} onChange={onChange} />;
  }

  if (question.id === "professional_experience" && question.type === "combined_cards") {
    return <ProfessionalExperienceQuestion question={question} value={value} onChange={onChange} />;
  }

  switch (question.type) {
    case "text":
      return <TextQuestionInput question={question} value={value} onChange={onChange} />;
    case "select":
      return <SelectQuestionInput question={question} value={value} onChange={onChange} />;
    case "multiple":
      return (
        <MultipleQuestionInput
          question={question as MultipleQuestion}
          value={value}
          onChange={onChange}
          hasInteracted={hasInteracted}
          setHasInteracted={setHasInteracted}
        />
      );
    case "conditional":
      return <ConditionalQuestionInput question={question} value={value} onChange={onChange} />;
    case "cv":
      return <CVQuestionInput question={question} value={value} onChange={onChange} />;
    case "age_cards":
      return <AgeCardQuestion question={question} value={value} onChange={onChange} />;
    case "gender_cards":
      return <GenderCardQuestion question={question} value={value} onChange={onChange} />;
    case "combined_cards":
      return <CombinedCardsQuestion question={question} value={value} onChange={onChange} />;
    case "slider":
      return <SliderQuestionInput question={question} value={value} onChange={onChange} />;
    case "vision_board":
      return <VisionBoardQuestionInput question={question} value={value} onChange={onChange} />;
    default:
      return null;
  }
};
