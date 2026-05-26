
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface WelcomeScreenProps {
  programName: string;
  setProgramName: (name: string) => void;
  startInterview: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  programName,
  setProgramName,
  startInterview
}) => {
  const [university, setUniversity] = useState("Harvard University");
  const [step, setStep] = useState(1);

  const handleStartInterview = () => {
    if (!programName) {
      toast.warning("Please enter a program name first");
      return;
    }
    startInterview();
  };

  return (
    <div className="max-w-xl mx-auto backdrop-blur-sm bg-white/90 p-8 rounded-xl shadow-lg border border-red-200 transition-all duration-500 animate-fade-in">
      <div className="flex items-center justify-center mb-4">
        <GraduationCap className="h-8 w-8 text-red-800 mr-3" />
        <h2 className="text-2xl font-semibold text-red-900 font-serif">Interview Preparation Platform</h2>
      </div>

      <p className="mb-8 text-neutral-700 font-serif text-center">
        Practice your university admissions interview with our AI-powered simulator.
        Receive personalized feedback on your responses.
      </p>

      <div className="space-y-6 mb-8 transition-all duration-300">
        <div className={`transition-all duration-500 ${step === 1 ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <Label htmlFor="university" className="text-sm font-medium text-red-900 font-serif block mb-2">
            Which university are you applying to?
          </Label>
          <Select defaultValue="Harvard University" onValueChange={val => {
            setUniversity(val);
            setTimeout(() => setStep(2), 300);
          }}>
            <SelectTrigger className="h-12 border-red-200 focus:border-red-800 focus:ring-2 focus:ring-red-200 transition-all duration-300">
              <SelectValue placeholder="Select a university" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Harvard University">Harvard University</SelectItem>
              <SelectItem value="Stanford University">Stanford University</SelectItem>
              <SelectItem value="MIT">Massachusetts Institute of Technology</SelectItem>
              <SelectItem value="Oxford University">Oxford University</SelectItem>
              <SelectItem value="Cambridge University">Cambridge University</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={`transition-all duration-500 ${step === 2 ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <Label htmlFor="program-name" className="text-sm font-medium text-red-900 font-serif block mb-2">
            Which program at {university} are you applying to?
          </Label>
          <Input
            id="program-name"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="e.g., Computer Science, Business Administration, History"
            className="h-12 border-red-200 focus:border-red-800 focus:ring-2 focus:ring-red-200 transition-all duration-300"
          />
        </div>
      </div>

      <Button
        onClick={handleStartInterview}
        className={`w-full bg-red-800 hover:bg-red-900 text-white transition-all duration-300 h-12 rounded-lg font-serif ${step === 1 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
        size="lg"
        disabled={step === 1}
      >
        <BookOpen className="mr-2 h-5 w-5" />
        Begin Your Practice Interview
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default WelcomeScreen;
