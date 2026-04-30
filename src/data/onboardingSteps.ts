
import { Step } from "../types/onboarding";
import { basicInformationStep } from "./steps/basicInformation";
// import { quickStartStep } from "./steps/quickStart"; // "Why are you interested in this degree?" — temporarily removed
import { backgroundStep } from "./steps/background";
import { goalsStep } from "./steps/goals";
import { strengthsStep } from "./steps/strengths";
import { personalStoryStep } from "./steps/personalStory";
import { inspirationalFiguresStep } from "./steps/inspirationalFigures";

export const steps: Step[] = [
  basicInformationStep,
  inspirationalFiguresStep,
  personalStoryStep,
  // quickStartStep, // "Why are you interested in this degree?" — temporarily removed
  backgroundStep,
  goalsStep,
  strengthsStep
];
