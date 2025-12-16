import { useState } from "react";
import { 
  GraduationCap, 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  MessageSquare,
  Sparkles,
  Bell,
  UserCircle,
  BookOpen,
  Award
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";

const mainItems = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Students", url: "/students", icon: Users },
  { title: "Essays", url: "/essays", icon: FileText },
  { title: "Applications", url: "/applications", icon: Calendar },
  { title: "Recommendations", url: "/recommendations", icon: GraduationCap },
  { title: "Rec. Letters", url: "/recommendation-letters", icon: Award },
  { title: "Messages", url: "/messages", icon: MessageSquare, badge: 3 },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const studentItems = [
  { title: "Student Dashboard", url: "/student-dashboard", icon: UserCircle },
  { title: "My Work", url: "/student-personal-area", icon: BookOpen },
  { title: "Recommendation Letters", url: "/student-recommendation-letters", icon: Award },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground";

  return (
    <>
      <Sidebar className={open ? "w-64" : "w-16"} variant="sidebar">
        <SidebarContent>
          {/* Logo Section */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              {open && (
                <div>
                  <h1 className="font-bold text-foreground">Primrose Review</h1>
                  <p className="text-xs text-muted-foreground">CRM Platform</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Counselor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {open && (
                          <>
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Student Portal Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Student Portal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {studentItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* AI Assistant */}
          {open && (
            <div className="mt-auto p-4 space-y-2">
              <Button 
                variant="outline"
                className="w-full justify-start gap-3 border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground hover:border-ai-accent"
                size="sm"
                onClick={() => setShowAIAssistant(true)}
              >
                <Sparkles className="h-4 w-4 text-ai-accent" />
                AI Assistant
              </Button>
            </div>
          )}
        </SidebarContent>
      </Sidebar>
      
      {/* AI Assistant Panel */}
      <AIAssistantPanel 
        isOpen={showAIAssistant} 
        onClose={() => setShowAIAssistant(false)} 
      />
    </>
  );
}