
export interface QuestionFeedback {
  overall: {
    score: number;
    summary: string;
  };
  categories: {
    content: {
      score: number;
      analysis: string;
    };
    delivery: {
      score: number;
      analysis: string;
    };
    confidence: {
      score: number;
      analysis: string;
    };
  };
  strengths: string[];
  improvements: string[];
}

export const generateFeedback = (response: string, question: string): QuestionFeedback => {
  const wordCount = response.split(/\s+/).length;
  const sentenceCount = response.split(/[.!?]+/).filter(Boolean).length;
  const avgSentenceLength = wordCount / Math.max(1, sentenceCount);

  let contentScore = Math.min(100, 40 + wordCount / 2);
  let deliveryScore = Math.min(100, 50 + (avgSentenceLength > 10 ? 20 : 0) + (sentenceCount > 3 ? 20 : 0));
  let confidenceScore = Math.min(100, 60 + wordCount / 3);

  contentScore = Math.round(contentScore * (0.9 + Math.random() * 0.2));
  deliveryScore = Math.round(deliveryScore * (0.9 + Math.random() * 0.2));
  confidenceScore = Math.round(confidenceScore * (0.9 + Math.random() * 0.2));

  const overallScore = Math.round((contentScore * 0.5) + (deliveryScore * 0.3) + (confidenceScore * 0.2));

  const strengths = [];
  if (contentScore > 70) strengths.push("Provided relevant and thorough content");
  if (wordCount > 50) strengths.push("Gave a detailed and comprehensive response");
  if (sentenceCount > 4) strengths.push("Structured your answer with multiple points");
  if (avgSentenceLength < 15 && avgSentenceLength > 7) strengths.push("Used clear and concise sentence structure");
  if (deliveryScore > 75) strengths.push("Conveyed your points in a well-structured manner");
  if (confidenceScore > 80) strengths.push("Demonstrated confidence in your response");

  const improvements = [];
  if (contentScore < 80) improvements.push("Include more specific examples to support your points");
  if (wordCount < 50) improvements.push("Expand your response with more detail");
  if (sentenceCount < 4) improvements.push("Structure your answer with more distinct points");
  if (avgSentenceLength > 20) improvements.push("Break down longer sentences for clarity");
  if (deliveryScore < 70) improvements.push("Work on organizing your response more clearly");
  if (confidenceScore < 75) improvements.push("Practice delivering your response with more confidence");

  if (strengths.length === 0) strengths.push("Attempted to address the question");
  if (improvements.length === 0) improvements.push("Continue practicing to refine your responses");

  let summary;
  if (overallScore >= 85) {
    summary = "Excellent response that thoroughly addressed the question with clear structure and relevant details.";
  } else if (overallScore >= 70) {
    summary = "Good response that covered the main points of the question, with some room for additional detail.";
  } else if (overallScore >= 50) {
    summary = "Satisfactory response that addressed basic elements of the question, but could be more comprehensive.";
  } else {
    summary = "Response needs more development to fully address the question with relevant examples and depth.";
  }

  return {
    overall: { score: overallScore, summary },
    categories: {
      content: {
        score: contentScore,
        analysis: contentScore > 70
          ? "Your response included relevant information that addressed the question well."
          : "Your response could benefit from more specific examples and details."
      },
      delivery: {
        score: deliveryScore,
        analysis: deliveryScore > 70
          ? "You structured your response in a clear and logical manner."
          : "Work on organizing your thoughts more coherently in your response."
      },
      confidence: {
        score: confidenceScore,
        analysis: confidenceScore > 70
          ? "Your response demonstrated confidence and clarity."
          : "Practice delivering responses with more assertiveness and conviction."
      }
    },
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 3)
  };
};
