import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Students from "./pages/Students";
import Essays from "./pages/Essays";
import Applications from "./pages/Applications";

import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import StudentDashboard from "./pages/StudentDashboard";
import StudentPersonalArea from "./pages/StudentPersonalArea";
import AddStudent from "./pages/AddStudent";
import ReviewEssays from "./pages/ReviewEssays";
import CheckDeadlines from "./pages/CheckDeadlines";
import ViewReports from "./pages/ViewReports";
import StudentRecommendationLetters from "./pages/StudentRecommendationLetters";
import CounselorRecommendationLetters from "./pages/CounselorRecommendationLetters";
import NotFound from "./pages/NotFound";
import primroseLogo from "@/assets/primrose-logo.png";
import clientLogo from "@/assets/client-logo.jpg";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <BrowserRouter>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Header with Logos */}
              <header className="h-14 flex items-center justify-between border-b border-border bg-background px-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <img 
                    src={primroseLogo} 
                    alt="The Primrose Review" 
                    className="h-10 w-auto"
                  />
                </div>
                <img 
                  src={clientLogo} 
                  alt="Client Logo" 
                  className="h-10 w-auto rounded"
                />
              </header>

              {/* Page Content */}
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/essays" element={<Essays />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/recommendation-letters" element={<CounselorRecommendationLetters />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                  <Route path="/student-personal-area" element={<StudentPersonalArea />} />
                  <Route path="/student-recommendation-letters" element={<StudentRecommendationLetters />} />
                  <Route path="/add-student" element={<AddStudent />} />
                  <Route path="/review-essays" element={<ReviewEssays />} />
                  <Route path="/check-deadlines" element={<CheckDeadlines />} />
                  <Route path="/view-reports" element={<ViewReports />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </SidebarProvider>
      
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
};

export default App;
