
import { Step } from "../types/onboarding";
import { basicInformationStep } from "./steps/basicInformation";
import { quickStartStep } from "./steps/quickStart";
import { backgroundStep } from "./steps/background";
import { goalsStep } from "./steps/goals";
import { strengthsStep } from "./steps/strengths";
import { personalStoryStep } from "./steps/personalStory";
import { inspirationalFiguresStep } from "./steps/inspirationalFigures";

export const steps: Step[] = [
  basicInformationStep,
  inspirationalFiguresStep,
  personalStoryStep,
  quickStartStep,
  backgroundStep,
  goalsStep,
  strengthsStep
];
