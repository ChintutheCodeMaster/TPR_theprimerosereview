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
