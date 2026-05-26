
import { useState, useEffect } from "react";
import { generateFeedback, QuestionFeedback } from "@/utils/feedbackAnalysis";
import { toast } from "sonner";

export const useInterviewState = () => {
  const [status, setStatus] = useState<"idle" | "preparing" | "interviewing" | "feedback" | "question-feedback" | "detailed-feedback" | "final-feedback">("idle");
  const [transcript, setTranscript] = useState("");
  const [displayedTranscript, setDisplayedTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [programName, setProgramName] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [completedAnswer, setCompletedAnswer] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<QuestionFeedback | null>(null);
  const [questionFeedbacks, setQuestionFeedbacks] = useState<QuestionFeedback[]>([]);
  const [autoRecording, setAutoRecording] = useState(true);
  const [silenceTimer, setSilenceTimer] = useState<number | null>(null);
  const [lastTranscriptLength, setLastTranscriptLength] = useState(0);
  const [silenceTimeout, setSilenceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [selfRating, setSelfRating] = useState<number>(0);

  useEffect(() => {
    if (status === "interviewing" || status === "question-feedback" || status === "detailed-feedback") {
      setFadeIn(true);
    }
  }, [status]);

  const startInterview = () => {
    if (!programName) {
      toast.warning("Please enter a program name first");
      return;
    }

    setStatus("preparing");

    const fullQuestionSet = [
      "Please introduce yourself briefly and tell me what sparked your interest in higher education.",
      `Why are you specifically interested in studying ${programName} at Harvard?`,
      "Tell me about a time when you faced a significant challenge in your academic journey. How did you overcome it?",
      "Harvard values leadership and community impact. Can you describe an instance where you've demonstrated these qualities?",
      "What unique perspective or contribution would you bring to the Harvard community?",
      "Describe a research project or academic work that you're particularly proud of.",
      "How do you plan to use the resources at Harvard to further your academic and professional goals?",
      "What aspects of Harvard's culture and community are you most excited about?",
      "Tell me about a book or article you've read recently that has influenced your thinking.",
      "How do you handle criticism or feedback on your work?",
      "Describe a situation where you had to work with people from different backgrounds or perspectives.",
      "What do you consider your greatest achievement so far, and why?",
      "How would your professors or peers describe your academic strengths and weaknesses?",
      "What questions do you have about the program or Harvard University in general?",
      "Is there anything else about your background or experience that you'd like the admissions committee to know?"
    ];

    setQuestions(fullQuestionSet);
    setCurrentQuestion(fullQuestionSet[0]);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setQuestionFeedbacks([]);
    setAutoRecording(true);
    setSelfRating(0);

    setTimeout(() => {
      setStatus("interviewing");
    }, 1500);
  };

  const submitResponse = () => {
    if (transcript.trim() || completedAnswer.trim()) {
      const responseText = transcript.trim() || completedAnswer.trim();
      const newResponses = [...responses];
      newResponses[currentQuestionIndex] = responseText;
      setResponses(newResponses);

      const feedbackResult = generateFeedback(responseText, currentQuestion);
      const newFeedbacks = [...questionFeedbacks];
      newFeedbacks[currentQuestionIndex] = feedbackResult;

      setCurrentFeedback(feedbackResult);
      setQuestionFeedbacks(newFeedbacks);

      setStatus("detailed-feedback");
    } else {
      toast.error("Please provide a response before submitting");
    }
  };

  const continueToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentQuestion(questions[currentQuestionIndex + 1]);
      setTranscript("");
      setDisplayedTranscript("");
      setCompletedAnswer("");
      setLastTranscriptLength(0);
      setSelfRating(0);
      setStatus("interviewing");
    } else {
      setStatus("final-feedback");
      generateFinalFeedback();
    }
  };

  const generateFinalFeedback = () => {
    const totalScores = questionFeedbacks.reduce((acc, feedback) => acc + feedback.overall.score, 0);
    const averageScore = Math.round(totalScores / questionFeedbacks.length);

    let enhancedFeedback = `
      <h3>Harvard Admissions Assessment</h3>
      <p>Thank you for participating in our complete Harvard interview simulation for the ${programName} program. Your overall performance scored ${averageScore}/100.</p>

      <h3>Summary of Responses</h3>
      <p>You've completed all ${questions.length} interview questions, demonstrating your preparation and commitment to the application process.</p>

      <h3>Strengths</h3>
      <ul>
        <li>You demonstrated a clear understanding of your academic interests and future goals.</li>
        <li>Your responses showed thoughtful reflection on personal experiences and lessons learned.</li>
        <li>You articulated your interest in Harvard's community and unique opportunities.</li>
        <li>Your ability to connect your past experiences with your future aspirations was notable.</li>
        <li>You presented complex ideas in an accessible and engaging manner.</li>
      </ul>

      <h3>Areas for Improvement</h3>
      <ul>
        <li>Consider providing more concrete examples of leadership and initiative.</li>
        <li>Develop more specific connections between your experiences and Harvard's values.</li>
        <li>Practice more concise responses that highlight your key achievements and aspirations.</li>
        <li>Work on varying your sentence structure to create more engagement with your interviewers.</li>
        <li>Consider how you might better convey your passion for your field through your tone and delivery.</li>
      </ul>

      <h3>Question-by-Question Assessment</h3>
    `;

    questions.forEach((question, index) => {
      const fb = questionFeedbacks[index];
      if (fb) {
        enhancedFeedback += `
          <div class="question-assessment">
            <h4>Question ${index + 1}: ${question.substring(0, 60)}...</h4>
            <p><strong>Score:</strong> ${fb.overall.score}/100</p>
            <p><strong>Analysis:</strong> ${fb.categories.content.analysis}</p>
            <p><strong>Key Strength:</strong> ${fb.strengths[0] || "N/A"}</p>
            <p><strong>Top Recommendation:</strong> ${fb.improvements[0] || "N/A"}</p>
          </div>
        `;
      }
    });

    enhancedFeedback += `
      <h3>Program-Specific Feedback</h3>
      <p>For the ${programName} program at Harvard, focus particularly on developing your research interests and how they align with current faculty work.</p>

      <h3>Personalized Recommendations</h3>
      <ol>
        <li>Schedule 2-3 more practice interviews with professionals in your field</li>
        <li>Research recent faculty publications in the ${programName} program</li>
        <li>Prepare a clear 2-minute narrative about your academic journey and motivations</li>
        <li>Practice answering questions about weaknesses or failures with a growth mindset</li>
        <li>Record yourself answering questions to analyze your verbal and non-verbal communication</li>
      </ol>
    `;

    setFeedback(enhancedFeedback);
  };

  const resetInterview = () => {
    setStatus("idle");
    setTranscript("");
    setDisplayedTranscript("");
    setFeedback("");
    setIsListening(false);
    setProgramName("");
    setQuestions([]);
    setResponses([]);
    setCurrentQuestionIndex(0);
    setCompletedAnswer("");
    setQuestionFeedbacks([]);
    setCurrentFeedback(null);
    setLastTranscriptLength(0);
    setSelfRating(0);

    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
      setSilenceTimeout(null);
    }
  };

  const tryAgain = () => {
    setTranscript("");
    setDisplayedTranscript("");
    setCompletedAnswer("");
    setCurrentFeedback(null);
    setSelfRating(0);
    setStatus("interviewing");
  };

  return {
    status,
    setStatus,
    transcript,
    setTranscript,
    displayedTranscript,
    setDisplayedTranscript,
    feedback,
    isListening,
    setIsListening,
    isSpeaking,
    setIsSpeaking,
    programName,
    setProgramName,
    currentQuestion,
    questions,
    currentQuestionIndex,
    responses,
    audioEnabled,
    setAudioEnabled,
    completedAnswer,
    setCompletedAnswer,
    fadeIn,
    currentFeedback,
    questionFeedbacks,
    autoRecording,
    setAutoRecording,
    silenceTimer,
    setSilenceTimer,
    lastTranscriptLength,
    setLastTranscriptLength,
    silenceTimeout,
    setSilenceTimeout,
    selfRating,
    setSelfRating,
    startInterview,
    submitResponse,
    continueToNextQuestion,
    resetInterview,
    tryAgain
  };
};
