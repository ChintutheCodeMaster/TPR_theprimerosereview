
import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { generatePersonalStatement, savePersonalStatement } from "@/functions/generate-personal-statement";
import { Loader2, ChevronRight, Sparkles, BookOpen, PenTool, Target, MessageSquare, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { useRouteTracking } from "@/hooks/useRouteTracking";

const StatementPreview = () => {
  const [fullStatement, setFullStatement] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuthState();
  const { getPlansRoute } = useRouteTracking();
  const { answers, anonymousId } = location.state || {};
  const [hasCheckedOnboardingData, setHasCheckedOnboardingData] = useState<boolean>(false);
  const hasGeneratedRef = useRef<boolean>(false);

  const initialAnswers = useMemo(() => {
    if (answers) return answers;
    const sa = sessionStorage.getItem('onboardingAnswers') || localStorage.getItem('onboardingAnswers');
    return sa ? JSON.parse(sa) : null;
  }, [answers]);

  const userId = useMemo(() => {
    if (anonymousId) return anonymousId;
    return sessionStorage.getItem('anonymousId') || localStorage.getItem('anonymousId');
  }, [anonymousId]);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!isAuthenticated || !user?.id) {
        setUserAnswers(initialAnswers);
        setHasCheckedOnboardingData(true);
        return;
      }
      try {
        const { data, error } = await supabase.from('onboarding_answers').select('answers, completed').eq('user_id', user.id).single();
        if (error && error.code !== 'PGRST116') { setUserAnswers(initialAnswers); setHasCheckedOnboardingData(true); return; }
        if (data?.answers) { setUserAnswers(data.answers); setHasCheckedOnboardingData(true); }
        else { setUserAnswers(initialAnswers); setHasCheckedOnboardingData(true); }
      } catch (error) { setUserAnswers(initialAnswers); setHasCheckedOnboardingData(true); }
    };
    if (!authLoading) fetchOnboardingData();
  }, [isAuthenticated, user?.id, authLoading]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      if (!initialAnswers) {
        navigate("/sign-up", { state: { redirectAfterAuth: "/onboarding", fromOnboarding: true, anonymousId: anonymousId || sessionStorage.getItem('anonymousId') || localStorage.getItem('anonymousId'), answers: answers || JSON.parse((sessionStorage.getItem('onboardingAnswers') || localStorage.getItem('onboardingAnswers') || '{}')) } });
      } else {
        navigate("/sign-up", { state: { redirectAfterAuth: "/statement-preview", fromOnboarding: true, anonymousId: anonymousId || sessionStorage.getItem('anonymousId') || localStorage.getItem('anonymousId'), answers: answers || JSON.parse((sessionStorage.getItem('onboardingAnswers') || localStorage.getItem('onboardingAnswers') || '{}')) } });
      }
      return;
    }
    if (!userAnswers && !hasCheckedOnboardingData) return;
    if (!userAnswers) { toast.error("No response data found. Please complete the onboarding questions first."); navigate("/onboarding"); return; }

    const generatePreview = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const statement = await generatePersonalStatement(userAnswers);
        if (statement && typeof statement === 'string') {
          const cleanedStatement = statement.replace(/^\*\*.*\*\*\n/, '');
          setFullStatement(cleanedStatement);
          if (isAuthenticated && user) {
            try {
              const universityName = userAnswers.universities || userAnswers.university_name || "University";
              await savePersonalStatement(`${universityName} Personal Statement - Preview`, cleanedStatement);
            } catch (saveError) { console.error("Error auto-saving essay:", saveError); }
          }
        } else { throw new Error("Invalid response format from API"); }
      } catch (error) {
        setError("We encountered an error generating your preview. Please try again.");
        toast.error("We encountered an error generating your preview. Please try again.");
      } finally { setIsLoading(false); }
    };

    if (userAnswers && !hasGeneratedRef.current) { hasGeneratedRef.current = true; generatePreview(); }
  }, [userAnswers, navigate, isAuthenticated, user, authLoading, hasCheckedOnboardingData]);

  const handleContinue = () => {
    navigate(getPlansRoute(), { state: { fromPreview: true, anonymousId: anonymousId || sessionStorage.getItem('anonymousId') || localStorage.getItem('anonymousId'), answers: answers || JSON.parse((sessionStorage.getItem('onboardingAnswers') || localStorage.getItem('onboardingAnswers') || '{}')) } });
  };

  const formatStatement = (text: string) => text.split('\n\n').map((paragraph, index) => <p key={index} className="mb-4 last:mb-0">{paragraph}</p>);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">We created this with just 4 questions. Imagine what your full story could be.</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">This is only the beginning of your personal statement. Unlock more questions, tailor your story, and present the best version of yourself to admissions committees.</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/5">
            <Card className="p-8 shadow-lg border-primary/10 bg-white min-h-[300px] flex flex-col justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-gray-600">Crafting your personal statement...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
                  <p>{error}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center mb-4">
                    <Sparkles className="text-amber-500 mr-2" />
                    <h2 className="text-xl font-semibold">Your Story, So Far...</h2>
                  </div>
                  <p className="text-sm text-gray-500 italic mb-4">Here's what we generated from your first 4 answers — a solid foundation. With just a few more details, we'll help you turn this into a powerful, personalized story for your top-choice schools.</p>
                  <div className="prose prose-lg max-w-none text-gray-800">
                    {fullStatement ? formatStatement(fullStatement) : <p className="text-gray-600 italic">Your personal journey is unique and compelling...</p>}
                  </div>
                </div>
              )}
            </Card>
          </div>
          <div className="lg:w-2/5">
            <Card className="p-8 bg-gradient-to-br from-white to-blue-50 shadow-lg border-primary/20 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center"><Lock className="w-5 h-5 mr-2 text-primary" />Unlock Premium Features</h2>
              <ul className="space-y-4">
                <FeatureItem icon={<BookOpen className="w-5 h-5 text-primary" />} title="Answer More Tailored Questions" description="Add your academic background, motivations, and unique experiences to deepen your story." />
                <FeatureItem icon={<PenTool className="w-5 h-5 text-primary" />} title="Craft a Cohesive, Compelling Narrative" description="Turn your answers into a powerful, structured personal statement with clear purpose and flow." />
                <FeatureItem icon={<Target className="w-5 h-5 text-primary" />} title="Tailor to Top Schools" description="Adjust tone and focus to align with what your dream programs are really looking for." />
                <FeatureItem icon={<MessageSquare className="w-5 h-5 text-primary" />} title="Polish Every Word" description="Enhance your writing with vivid, memorable phrasing while staying true to your voice." />
              </ul>
              <div className="mt-8">
                <Button onClick={handleContinue} className="w-full py-6 text-lg group hover:shadow-lg transition-all duration-300">
                  Unlock Your Full Story <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-center mt-4 text-sm text-gray-500">Your story deserves to be unforgettable. Let's make it happen.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <li className="flex gap-3">
    <div className="mt-1 flex-shrink-0">{icon}</div>
    <div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </li>
);

export default StatementPreview;
