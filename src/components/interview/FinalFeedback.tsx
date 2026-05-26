
import React from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, BarChart3, Star, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { QuestionFeedback } from "@/utils/feedbackAnalysis";
import AnimatedNumber from "./AnimatedNumber";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import DOMPurify from 'dompurify';

interface FinalFeedbackProps {
  feedback: string;
  questionFeedbacks: QuestionFeedback[];
  questions: string[];
  resetInterview: () => void;
}

const FinalFeedback: React.FC<FinalFeedbackProps> = ({
  feedback,
  questionFeedbacks,
  questions,
  resetInterview
}) => {
  const overallScore = questionFeedbacks.reduce((acc, f) => acc + f.overall.score, 0) / questionFeedbacks.length;

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: "A", color: "text-green-600" };
    if (score >= 80) return { grade: "B", color: "text-blue-600" };
    if (score >= 70) return { grade: "C", color: "text-yellow-600" };
    if (score >= 60) return { grade: "D", color: "text-orange-600" };
    return { grade: "F", color: "text-red-600" };
  };

  const overallGrade = getGrade(overallScore);

  return (
    <div className="max-w-5xl mx-auto backdrop-blur-sm bg-white/90 p-8 rounded-xl shadow-lg border border-red-200 transition-all duration-500 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <GraduationCap className="h-6 w-6 text-red-800" />
        <h2 className="text-2xl font-semibold text-red-900 font-serif">
          Harvard Interview Assessment
        </h2>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="mb-6 grid grid-cols-4 h-auto">
          <TabsTrigger value="summary" className="py-2">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span>Overall Performance</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="questions" className="py-2">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span>Question Analysis</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="strengths" className="py-2">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Strengths</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="py-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              <span>Recommendations</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="animate-fade-in space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="md:w-1/3">
              <CardContent className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-red-900 font-serif mb-2">Overall Grade</h3>
                <div className="text-7xl font-bold font-serif mb-2 flex items-center justify-center">
                  <span className={`${overallGrade.color}`}>{overallGrade.grade}</span>
                </div>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Performance Score</span>
                    <span className="text-sm font-medium">{Math.round(overallScore)}/100</span>
                  </div>
                  <Progress value={overallScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="md:w-2/3">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-red-900 font-serif mb-4">Performance Summary</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Content</h4>
                      <div className="text-2xl font-bold text-red-800">
                        {Math.round(questionFeedbacks.reduce((acc, f) => acc + f.categories.content.score, 0) / questionFeedbacks.length)}
                        <span className="text-sm text-red-600 ml-1">/100</span>
                      </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Delivery</h4>
                      <div className="text-2xl font-bold text-red-800">
                        {Math.round(questionFeedbacks.reduce((acc, f) => acc + f.categories.delivery.score, 0) / questionFeedbacks.length)}
                        <span className="text-sm text-red-600 ml-1">/100</span>
                      </div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-red-800 mb-1">Confidence</h4>
                      <div className="text-2xl font-bold text-red-800">
                        {Math.round(questionFeedbacks.reduce((acc, f) => acc + f.categories.confidence.score, 0) / questionFeedbacks.length)}
                        <span className="text-sm text-red-600 ml-1">/100</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="prose max-w-none mt-4 text-sm text-gray-700 font-serif"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(feedback.split("<h3>Question-by-Question Assessment</h3>")[0])
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="animate-fade-in">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-red-900 font-serif mb-4">
                Question-by-Question Analysis
              </h3>
              <div className="space-y-4">
                {questionFeedbacks.map((fb, idx) => (
                  <div key={idx} className="border border-red-100 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">Question {idx + 1}</h4>
                        <p className="text-sm text-gray-600">{questions[idx]}</p>
                      </div>
                      <div className="ml-4 flex items-center">
                        <div className={`text-lg font-bold px-2 py-1 rounded ${getGrade(fb.overall.score).color}`}>
                          {getGrade(fb.overall.score).grade}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">{fb.overall.score}/100</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Content</span>
                          <span>{fb.categories.content.score}/100</span>
                        </div>
                        <Progress value={fb.categories.content.score} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Delivery</span>
                          <span>{fb.categories.delivery.score}/100</span>
                        </div>
                        <Progress value={fb.categories.delivery.score} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Confidence</span>
                          <span>{fb.categories.confidence.score}/100</span>
                        </div>
                        <Progress value={fb.categories.confidence.score} className="h-1.5" />
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{fb.overall.summary}</p>

                    <div className="flex flex-wrap gap-2">
                      {fb.strengths.length > 0 && (
                        <div className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                          {fb.strengths[0]}
                        </div>
                      )}
                      {fb.improvements.length > 0 && (
                        <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                          {fb.improvements[0]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strengths" className="animate-fade-in">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-red-900 font-serif mb-4">
                Your Key Strengths
              </h3>
              <div className="space-y-3">
                {Array.from(new Set(questionFeedbacks.flatMap(f => f.strengths))).map((strength, idx) => (
                  <div key={idx} className="flex items-start p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 shrink-0" />
                    <span className="text-gray-700">{strength}</span>
                  </div>
                ))}
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(feedback.split("<h3>Strengths</h3>")[1]?.split("<h3>")[0] || "")
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="animate-fade-in">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-red-900 font-serif mb-4">
                Personalized Recommendations
              </h3>
              <div className="space-y-3">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      feedback.split("<h3>Personalized Recommendations</h3>")[1]?.split("<h3>")[0] ||
                      feedback.split("<h3>Areas for Improvement</h3>")[1]?.split("<h3>")[0] || ""
                    )
                  }}
                />
                {Array.from(new Set(questionFeedbacks.flatMap(f => f.improvements))).map((improvement, idx) => (
                  <div key={idx} className="flex items-start p-3 bg-blue-50 rounded-lg">
                    <Star className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
                    <span className="text-gray-700">{improvement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={resetInterview}
          className="border-red-200 text-red-900 hover:bg-red-50 transition-all duration-300 font-serif"
        >
          Start New Interview
        </Button>
        <Button
          onClick={() => {
            toast.success("Your interview feedback has been saved", {
              description: "You can access it from your dashboard"
            });
          }}
          className="bg-red-800 hover:bg-red-900 text-white transition-all duration-300 font-serif"
        >
          Save Feedback
        </Button>
      </div>
    </div>
  );
};

export default FinalFeedback;
