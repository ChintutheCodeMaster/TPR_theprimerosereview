import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { DemoNavigation } from "@/components/DemoNavigation";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";
import Students from "./pages/Students";
import Essays from "./pages/Essays";
import Applications from "./pages/Applications";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import StudentDashboard from "./pages/StudentDashboard";
import StudentPersonalArea from "./pages/StudentPersonalArea";
import StudentStats from "./pages/StudentStats";
import ParentPortal from "./pages/ParentPortal";
import AddStudent from "./pages/AddStudent";
// import ReviewEssays from "./pages/ReviewEssays";
import CheckDeadlines from "./pages/CheckDeadlines";
import ViewReports from "./pages/ViewReports";
import StudentRecommendationLetters from "./pages/StudentRecommendationLetters";
import CounselorRecommendationLetters from "./pages/CounselorRecommendationLetters";
import EssayAnalytics from "./pages/EssayAnalytics";
import NotFound from "./pages/NotFound";
import primroseLogo from "@/assets/primrose-logo.png";
import clientLogo from "@/assets/client-logo.jpg";
import Signup from "./pages/SignUp";
import SubmitEssay from "./pages/SubmitEssay";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();
// Layout component that conditionally shows sidebar
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const noSidebarRoutes = ['/', '/auth', '/demo'];
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with Logos */}
          <header className="h-20 flex items-center justify-between border-b border-border bg-background px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <img 
                src={primroseLogo} 
                alt="The Primrose Review" 
                className="h-12 w-auto"
              />
            </div>
            <img 
              src={clientLogo} 
              alt="Client Logo" 
              className="h-16 w-auto rounded"
            />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        
        {/* Demo Navigation - floating button */}
        <DemoNavigation />
      </div>
    </SidebarProvider>
  );
};


const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes without sidebar */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/signup" element={<Signup />} />
                 

          {/* Protected routes with sidebar */}
          {/* <Route path="/dashboard" element={<AppLayout><Index /></AppLayout>} /> */}
          <Route path="/dashboard" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor']}>
                <Index />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/students" element={<AppLayout><Students /></AppLayout>} />
          <Route path="/essays" element={<AppLayout><Essays /></AppLayout>} />
          <Route path="/essay-analytics" element={<AppLayout><EssayAnalytics /></AppLayout>} />
          <Route path="/applications" element={<AppLayout><Applications /></AppLayout>} />
          <Route path="/recommendation-letters" element={<AppLayout><CounselorRecommendationLetters /></AppLayout>} />
          <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
          <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />          
          {/* <Route path="/student-dashboard" element={<AppLayout><StudentDashboard /></AppLayout>} /> */}
          <Route path="/student-dashboard" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            </AppLayout>
          } />

          {/* <Route path="/student-personal-area" element={<AppLayout><StudentPersonalArea /></AppLayout>} /> */}
           <Route path="/student-personal-area" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <StudentPersonalArea />
              </ProtectedRoute>
            </AppLayout>
          } />

          {/* <Route path="/submit-essay" element={<AppLayout><SubmitEssay /></AppLayout>} />   */}
          <Route path="/submit-essay" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <SubmitEssay />
              </ProtectedRoute>
            </AppLayout>
          } />
          <Route path="/student-recommendation-letters" element={<AppLayout><StudentRecommendationLetters /></AppLayout>} />
          <Route path="/student-stats" element={<AppLayout><StudentStats /></AppLayout>} />
          <Route path="/parent-portal" element={<AppLayout><ParentPortal /></AppLayout>} />
          <Route path="/add-student" element={<AppLayout><AddStudent /></AppLayout>} />
          {/* <Route path="/review-essays" element={<AppLayout><ReviewEssays /></AppLayout>} /> */}
          <Route path="/check-deadlines" element={<AppLayout><CheckDeadlines /></AppLayout>} />
          <Route path="/view-reports" element={<AppLayout><ViewReports /></AppLayout>} />


          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
};

export default App;
