
import { Step } from "../../types/onboarding";

export const quickStartStep: Step = {
  title: "Quick Start",
  description: "Let's get started! We'll ask a few questions to tailor your personal statement.",
  questions: [
    {
      id: "degree_interest",
      question: "Why are you interested in this degree?",
      type: "text",
      placeholder: "It could be something from long ago, or more recent, from a professional/academic perspective, or a personal one. We want to get to know you!",
      maxLength: 500
    }
  ]
};
