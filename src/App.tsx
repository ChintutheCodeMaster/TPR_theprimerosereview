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
import Recommendations from "./pages/Recommendations";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import StudentDashboard from "./pages/StudentDashboard";
import StudentPersonalArea from "./pages/StudentPersonalArea";
import AddStudent from "./pages/AddStudent";
import ReviewEssays from "./pages/ReviewEssays";
import CheckDeadlines from "./pages/CheckDeadlines";
import NotFound from "./pages/NotFound";

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
              {/* Header with Sidebar Toggle */}
              <header className="h-14 flex items-center border-b border-border bg-background px-4">
                <SidebarTrigger />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-foreground">The Primrose Review CRM</h2>
                </div>
              </header>

              {/* Page Content */}
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/essays" element={<Essays />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                  <Route path="/student-personal-area" element={<StudentPersonalArea />} />
                  <Route path="/add-student" element={<AddStudent />} />
                  <Route path="/review-essays" element={<ReviewEssays />} />
                  <Route path="/check-deadlines" element={<CheckDeadlines />} />
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
