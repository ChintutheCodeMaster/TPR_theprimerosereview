export type QuestionType = "text" | "select" | "multiple" | "conditional" | "age_cards" | "gender_cards" | "cv" | "slider" | "combined_cards" | "vision_board";

export interface BaseQuestion {
  id: string;
  question: string | ((answers: Record<string, any>) => string);
  type: QuestionType;
  optional?: boolean;
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
  placeholder?: string;
  validation?: (value: string) => string | null;
  maxLength?: number;
}

export interface SelectOption {
  value: string;
  icon?: string;
}

export interface SelectQuestion extends BaseQuestion {
  type: "select";
  options: string[] | SelectOption[];
}

export interface MultipleQuestion extends BaseQuestion {
  type: "multiple";
  options: string[];
  maxChoices: number;
  followUp?: {
    type: "text";
    placeholder: string;
    maxLength: number;
  };
}

export interface ConditionalQuestion extends BaseQuestion {
  type: "conditional";
  options: string[];
  followUp: {
    condition: string;
    type: "text";
    placeholder: string;
    maxLength: number;
  };
}

export interface SliderQuestion extends BaseQuestion {
  type: "slider";
  min: number;
  max: number;
  step: number;
  marks: Array<{ value: number; label: string }>;
}

export interface AgeCardsQuestion extends BaseQuestion {
  type: "age_cards";
  options: Array<{
    range: string;
    icon: string;
  }>;
}

export interface GenderCardsQuestion extends BaseQuestion {
  type: "gender_cards";
  options: Array<{
    value: string;
    icon: string;
  }>;
}

export interface CombinedCardsQuestion extends BaseQuestion {
  type: "combined_cards";
  subQuestions: Array<TextQuestion | SelectQuestion | AgeCardsQuestion | GenderCardsQuestion>;
}

export interface CVQuestion extends BaseQuestion {
  type: "cv";
  placeholder: string;
}

export interface VisionBoardQuestion extends BaseQuestion {
  type: "vision_board";
  description?: string;
  categories?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export type Question =
  | TextQuestion
  | SelectQuestion
  | MultipleQuestion
  | ConditionalQuestion
  | AgeCardsQuestion
  | GenderCardsQuestion
  | CVQuestion
  | SliderQuestion
  | CombinedCardsQuestion
  | VisionBoardQuestion;

export interface Step {
  title: string;
  description: string;
  questions: Question[];
}
