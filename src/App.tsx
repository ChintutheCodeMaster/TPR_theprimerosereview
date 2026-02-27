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
import AddApplication from "./pages/AddApplication";
import EditEssay from "./pages/EditEssay";

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
          {/* ── Public routes (no sidebar, no auth) ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Counselor-only routes ── */}
          <Route path="/dashboard" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <Index />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/students" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <Students />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/essays" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <Essays />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/essay-analytics" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <EssayAnalytics />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/applications" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <Applications />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/recommendation-letters" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <CounselorRecommendationLetters />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/messages" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <Messages />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/notifications" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <Notifications />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/add-student" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <AddStudent />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/check-deadlines" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <CheckDeadlines />
              </ProtectedRoute>
            </AppLayout>
          } />

          <Route path="/view-reports" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['counselor', 'admin']}>
                <ViewReports />
              </ProtectedRoute>
            </AppLayout>
          } />

          {/* ── Student-only routes ── */}
          <Route path="/student-dashboard" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            </AppLayout>
          } />

          {/* Edit Essay */}
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

          <Route path="/student-recommendation-letters" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['student']}>
                <StudentRecommendationLetters />
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

          {/* ── Parent-only routes ── */}
          <Route path="/parent-portal" element={
            <AppLayout>
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentPortal />
              </ProtectedRoute>
            </AppLayout>
          } />

          {/* ── Catch-all ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
};

export default App;