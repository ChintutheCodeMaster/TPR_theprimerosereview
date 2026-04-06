
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Home, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const OnboardingSuccess = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthState();
  const [isVerifying, setIsVerifying] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState<boolean>(false);
  const [retrying, setRetrying] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { if (isVerifying) setLoadingTimeout(true); }, 5000);
    return () => clearTimeout(timer);
  }, [isVerifying]);

  useEffect(() => {
    const verifyData = async () => {
      if (!isAuthenticated || !user || hasAttemptedFetch) { setIsVerifying(false); return; }
      setHasAttemptedFetch(true);
      try {
        const sessionData = sessionStorage.getItem('onboardingAnswers');
        if (sessionData) { setUserData(JSON.parse(sessionData)); setIsVerifying(false); return; }
        const { data, error } = await supabase.from('onboarding_answers').select('answers').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).single();
        if (error) { setError("We're having trouble accessing your saved information. You can still continue to the personal statement page."); setIsVerifying(false); }
        else if (!data) { setError("No profile data found. You may need to complete the onboarding process again."); setIsVerifying(false); }
        else { setUserData(data.answers); sessionStorage.setItem('onboardingAnswers', JSON.stringify(data.answers)); setIsVerifying(false); }
      } catch (error) { setError("Unexpected error accessing your profile data."); setIsVerifying(false); }
    };
    verifyData();
  }, [isAuthenticated, user, retrying]);

  useEffect(() => {
    if (!isAuthenticated && !isVerifying) navigate("/login", { state: { from: "/onboarding-success" } });
  }, [isAuthenticated, isVerifying, navigate]);

  const handleGoToPersonalStatement = () => {
    setIsNavigating(true);
    toast.info("Preparing your personal statement experience...");
    setTimeout(() => {
      if (userData) navigate("/statement-preview", { state: { answers: userData } });
      else navigate("/statement-preview");
    }, 500);
  };

  const handleRetry = () => {
    setIsVerifying(true);
    setLoadingTimeout(false);
    setError(null);
    setHasAttemptedFetch(false);
    setRetrying(prev => !prev);
    toast.info("Retrying data verification...");
  };

  if (isVerifying && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-blue-100">
        <div className="bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <Trophy className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Congratulations!</h1>
        <p className="text-gray-600 mb-8">We've successfully collected your information. Your personal statement is ready to be generated.</p>
        {error && <Alert variant="destructive" className="mb-6"><AlertTitle>Notice</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {isVerifying && loadingTimeout && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertTitle className="text-amber-800">Taking longer than expected</AlertTitle>
            <AlertDescription className="text-amber-700">
              Data verification is taking longer than expected. You can continue, or retry.
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleRetry}><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button>
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleGoToPersonalStatement} size="lg" disabled={isNavigating}>
            {isNavigating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparing Your Statement...</> : <>View My Personal Statement<ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/student-dashboard")} disabled={isNavigating}>
            <Home className="mr-2 h-4 w-4" /> Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSuccess;
