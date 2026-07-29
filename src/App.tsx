import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Rocket, CheckCircle2 } from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import { GatePage } from "@/components/lander/GatePage";
import { V5Page } from "@/components/lander/v5/V5Page";
import Demo from "./pages/Demo";
import StudentDashboard from "./pages/StudentDashboard";
import StudentGuide from "./pages/StudentGuide";
import StudentPersonalArea from "./pages/StudentPersonalArea";
import StudentStats from "./pages/StudentStats";
import NotFound from "./pages/NotFound";
import primroseLogo from "@/assets/primrose-logo.png";
import clientLogo from "@/assets/client-logo.jpg";
import { useSchoolLogo } from "@/hooks/useSchoolLogo";
import Signup from "./pages/SignUp";
import SubmitEssay from "./pages/SubmitEssay";
import ProtectedRoute from "./components/ProtectedRoute";
import AddApplication from "./pages/AddApplication";
import EditEssay from "./pages/EditEssay";
import OnboardingPage from "./pages/Onboarding";
import LoadingNew from "./pages/Loading-new";
import StatementPreview from "./pages/StatementPreview";
import OnboardingSuccess from "./pages/OnboardingSuccess";
import DemoMaker from "./pages/DemoMaker";
import ProductDemo from "./pages/ProductDemo";
import PersonalEssay from "./pages/PersonalEssay";
import ResetPassword from "./pages/ResetPassword";
import EvaluationEngine from "./pages/EvaluationEngine";
import PrimroseLab from "./pages/PrimroseLab";
import ScholarshipFinder from "./pages/ScholarshipFinder";
import TuitionCalculator from "./pages/TuitionCalculator";
import StudentEditProfile from "./pages/StudentEditProfile";
import WeeklyChallenge from "./pages/WeeklyChallenge";
import InterviewSimulator from "./pages/InterviewSimulator";
import AIVoiceChat from "./pages/AIVoiceChat";
import { useSessionTracking } from "./hooks/useSessionTracking";
import { AppFooter } from "@/components/AppFooter";
import { CompanionSessionProvider } from "@/contexts/CompanionSessionContext";
import { StudentCompanionRail } from "@/components/companion/StudentCompanionRail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import ContactUs from "./pages/ContactUs";
import ContactSupport from "./pages/ContactSupport";

const queryClient = new QueryClient();

// Must live inside <BrowserRouter> to access useLocation
const SessionTracker = () => {
  useSessionTracking();
  return null;
};

// Layout component that conditionally shows sidebar
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthState();
  const { data: schoolLogoUrl } = useSchoolLogo();
  const logoSrc = schoolLogoUrl ?? clientLogo;
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const noSidebarRoutes = ['/', '/v5', '/auth', '/auth/callback', '/login', '/demo', '/product-demo', '/demo-maker', '/reset-password'];
  const isStudentRoute =
  [
    '/student-dashboard',
    '/primrose-lab',
    '/scholarship-finder',
    '/tuition-calculator',
    '/student-personal-area',
    '/student-stats',
    '/evaluation-engine',
    '/student-profile',
    '/weekly-challenge',
    '/interview-simulator',
  ].includes(location.pathname) ||
  location.pathname === '/submit-essay' ||
  location.pathname === '/personal-essay' ||
  location.pathname === '/add-application';
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const checkOnboarding = async () => {
      const { data } = await supabase
        .from('onboarding_answers')
        .select('completed')
        .eq('user_id', user.id)
        .eq('completed', true)
        .maybeSingle();
      if (data?.completed) setOnboardingCompleted(true);
    };
    checkOnboarding();
  }, [isAuthenticated, user]);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        {/* Sidebar + Main content row */}
        <div className="flex flex-1 min-h-0">
          <AppSidebar />
          <StudentCompanionRail />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header with Logos */}
            <header className="h-20 flex items-center justify-between hairline-b bg-background/70 backdrop-blur-xl px-4 shrink-0 sticky top-0 z-40">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-foreground/70 hover:text-foreground" />
                <img
                  src={primroseLogo}
                  alt="The Primrose Review"
                  className="h-12 w-auto"
                />
              </div>
              <div className="flex items-center gap-4">
                {isStudentRoute && (
                  onboardingCompleted ? (
                    <Button
                      onClick={() => toast.success("You've completed your onboarding — welcome aboard! We're so excited to have you here.", { duration: 4000 })}
                      className="gap-2 bg-transparent hairline text-[color:var(--pn-sage)] hover:bg-white/[0.03] font-medium transition-colors shadow-none"
                      size="sm"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Onboarding Complete!
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/onboarding')}
                      className="gap-2 bg-transparent hairline text-muted-foreground hover:text-foreground hover:bg-white/[0.03] font-medium transition-colors shadow-none"
                      size="sm"
                    >
                      <Rocket className="h-4 w-4" />
                      Complete full onboarding here
                    </Button>
                  )
                )}
                <img
                  src={logoSrc}
                  alt="School Logo"
                  className="h-16 w-auto rounded"
                />
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto pb-24">
              {children}
            </main>
          </div>
        </div>

        {/* Footer spans full width below sidebar + content */}
      {/* <AppFooter /> */}
      </div>
    </SidebarProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionTracker />
        <CompanionSessionProvider>
        <Routes>
          {/* ── Public routes (no sidebar, no auth) ── */}
          <Route path="/" element={<GatePage />} />
          <Route path="/v5" element={<V5Page />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── Student-only routes ── */}
          <Route path="/student-guide" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentGuide />
            </ProtectedRoute>
          } />

          <Route path="/student-profile" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <StudentEditProfile />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/student-dashboard" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/edit-essay" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <EditEssay />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/student-personal-area" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <StudentPersonalArea />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/submit-essay" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <SubmitEssay />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/student-stats" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <StudentStats />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/add-application" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <AddApplication />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/personal-essay" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <PersonalEssay />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/evaluation-engine" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <EvaluationEngine />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/primrose-lab" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <PrimroseLab />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/scholarship-finder" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <ScholarshipFinder />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/tuition-calculator" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <TuitionCalculator />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/weekly-challenge" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <WeeklyChallenge />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/interview-simulator" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <InterviewSimulator />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/ai-voice-chat" element={<AIVoiceChat />} />

          {/* ── Onboarding ── */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/loading-new" element={<LoadingNew />} />
          <Route path="/statement-preview" element={<StatementPreview />} />
          <Route path="/onboarding-success" element={<OnboardingSuccess />} />

          {/* ── Demo ── */}
          <Route path="/product-demo" element={<ProductDemo />} />
          <Route path="/demo-maker" element={<DemoMaker />} />

          {/* ── Legal pages (public) ── */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/contact-support" element={<ContactSupport />} />

          {/* ── Catch-all ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </CompanionSessionProvider>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
};

export default App;
