
import React, { useState, useEffect } from "react";
import { QuestionFeedback } from "@/utils/feedbackAnalysis";
import { CircleCheck, CircleAlert, LightbulbIcon, ChevronRight, BarChart3, MessageSquare, Volume2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { speakText } from "@/utils/textToSpeech";

interface FeedbackDisplayProps {
  feedback: QuestionFeedback;
  questionText: string;
  userResponse: string;
  onContinue: () => void;
  audioEnabled: boolean;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.min(100, Math.max(0, value));
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

const ScoreGauge = ({ score }: { score: number }) => {
  let color = "bg-red-500";
  if (score >= 90) color = "bg-green-500";
  else if (score >= 80) color = "bg-emerald-400";
  else if (score >= 70) color = "bg-blue-500";
  else if (score >= 60) color = "bg-yellow-500";
  else if (score >= 50) color = "bg-orange-500";

  return (
    <div className="relative w-48 h-48 mx-auto mb-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-800">
          <AnimatedNumber value={score} />
        </div>
      </div>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle className="fill-none stroke-neutral-100" strokeWidth="8" cx="50" cy="50" r="40" />
        <circle
          className={`fill-none ${color} animate-[dash_1.5s_ease-in-out_forwards]`}
          style={{
            strokeDasharray: `${Math.min(100, Math.max(0, score)) * 2.51} 251`,
            strokeDashoffset: 0,
            transformOrigin: "center",
            transform: "rotate(-90deg)"
          }}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r="40"
        />
      </svg>
    </div>
  );
};

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  feedback,
  questionText,
  userResponse,
  onContinue,
  audioEnabled
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakFeedback = async () => {
    if (!audioEnabled) return;

    setIsSpeaking(true);
    const feedbackSummary = `
      Here's my feedback on your answer.
      Overall, your response scored ${feedback.overall.score} out of 100.
      ${feedback.overall.summary}
      Your key strengths were: ${feedback.strengths.join(", ")}.
      Areas to improve include: ${feedback.improvements.join(", ")}.
    `;

    await speakText(feedbackSummary);
    setIsSpeaking(false);
  };

  const getBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-500 hover:bg-green-600";
    if (score >= 80) return "bg-emerald-500 hover:bg-emerald-600";
    if (score >= 70) return "bg-blue-500 hover:bg-blue-600";
    if (score >= 60) return "bg-yellow-500 hover:bg-yellow-600";
    if (score >= 50) return "bg-orange-500 hover:bg-orange-600";
    return "bg-red-500 hover:bg-red-600";
  };

  useEffect(() => {
    if (audioEnabled) {
      handleSpeakFeedback();
    }
  }, []);

  return (
    <div className="backdrop-blur-md bg-white/90 p-6 rounded-2xl shadow-lg border border-neutral-100 transition-all duration-500 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2 text-red-900">
          Answer Analysis
        </h2>
        <p className="text-neutral-600">
          Your response has been analyzed to provide personalized feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="col-span-1 text-center">
          <ScoreGauge score={feedback.overall.score} />
          <Badge className={`text-white px-3 py-1.5 ${getBadgeColor(feedback.overall.score)}`}>
            Overall Score
          </Badge>
          <p className="mt-4 text-neutral-700">{feedback.overall.summary}</p>
          {audioEnabled && (
            <Button
              onClick={handleSpeakFeedback}
              variant="ghost"
              className="mt-2 text-red-800"
              disabled={isSpeaking}
            >
              {isSpeaking ? (
                <>
                  <div className="flex items-center gap-1 mr-2">
                    <div className="w-1 h-3 bg-red-800 animate-pulse rounded-full"></div>
                    <div className="w-1 h-4 bg-red-800 animate-pulse rounded-full" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1 h-2 bg-red-800 animate-pulse rounded-full" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  Speaking...
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-1" />
                  Hear Feedback
                </>
              )}
            </Button>
          )}
        </div>

        <div className="col-span-1 md:col-span-2">
          <Tabs defaultValue="strengths">
            <TabsList className="w-full bg-neutral-100 p-1">
              <TabsTrigger value="strengths" className="flex-1">
                <CircleCheck className="h-4 w-4 mr-1" />
                <span>Strengths</span>
              </TabsTrigger>
              <TabsTrigger value="improvements" className="flex-1">
                <LightbulbIcon className="h-4 w-4 mr-1" />
                <span>Improvements</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex-1">
                <BarChart3 className="h-4 w-4 mr-1" />
                <span>Breakdown</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="strengths" className="mt-4 min-h-[200px]">
              <ul className="space-y-3">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5 mr-2">
                      <CircleCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-neutral-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="improvements" className="mt-4 min-h-[200px]">
              <ul className="space-y-3">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5 mr-2">
                      <LightbulbIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-neutral-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="categories" className="mt-4 min-h-[200px]">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700">Content</span>
                    <span className="text-sm font-medium text-neutral-700">{feedback.categories.content.score}%</span>
                  </div>
                  <Progress value={feedback.categories.content.score} className="h-2" />
                  <p className="mt-1 text-sm text-neutral-500">{feedback.categories.content.analysis}</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700">Delivery</span>
                    <span className="text-sm font-medium text-neutral-700">{feedback.categories.delivery.score}%</span>
                  </div>
                  <Progress value={feedback.categories.delivery.score} className="h-2" />
                  <p className="mt-1 text-sm text-neutral-500">{feedback.categories.delivery.analysis}</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-700">Confidence</span>
                    <span className="text-sm font-medium text-neutral-700">{feedback.categories.confidence.score}%</span>
                  </div>
                  <Progress value={feedback.categories.confidence.score} className="h-2" />
                  <p className="mt-1 text-sm text-neutral-500">{feedback.categories.confidence.analysis}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1 flex items-center">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Question
          </h3>
          <p className="text-neutral-700 bg-neutral-50 p-3 rounded-xl">{questionText}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-1 flex items-center">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Your Response
          </h3>
          <p className="text-neutral-700 bg-neutral-50 p-3 rounded-xl">{userResponse}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          className="bg-red-800 hover:bg-red-900 text-white transition-all duration-300"
        >
          Continue
          <ChevronRight className="ml-1 h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
};
