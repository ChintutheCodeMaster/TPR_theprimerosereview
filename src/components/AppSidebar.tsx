import { useMemo } from "react";
import { GraduationCap, Users, FileText, Calendar, BarChart3, MessageSquare, Bell, UserCircle, BookOpen, Award, Home, Lock } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type UserRole = 'counselor' | 'student' | 'parent';

const mainItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: BarChart3
}, {
  title: "Students",
  url: "/students",
  icon: Users
}, {
  title: "Essays",
  url: "/essays",
  icon: FileText
}, {
  title: "Applications",
  url: "/applications",
  icon: Calendar
}, {
  title: "Recommendation Letters",
  url: "/recommendation-letters",
  icon: Award
}, {
  title: "Messages",
  url: "/messages",
  icon: MessageSquare,
  badge: 3
}, {
  title: "Notifications",
  url: "/notifications",
  icon: Bell
}];

const studentItems = [{
  title: "Student Dashboard",
  url: "/student-dashboard",
  icon: UserCircle
}, {
  title: "My Work",
  url: "/student-personal-area",
  icon: BookOpen
}, {
  title: "Recommendation Letters",
  url: "/student-recommendation-letters",
  icon: Award
}, {
  title: "My Stats",
  url: "/student-stats",
  icon: BarChart3
}];

const parentItems = [{
  title: "Parent Portal",
  url: "/parent-portal",
  icon: Home
}];

// Routes that belong to each role
const counselorRoutes = ['/dashboard', '/students', '/essays', '/applications', '/recommendation-letters', '/messages', '/notifications', '/add-student', '/review-essays', '/check-deadlines', '/view-reports'];
const studentRoutes = ['/student-dashboard', '/student-personal-area', '/student-recommendation-letters', '/student-stats'];
const parentRoutes = ['/parent-portal'];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  // Determine current user role based on the route
  const currentRole: UserRole = useMemo(() => {
    if (studentRoutes.some(route => currentPath.startsWith(route))) return 'student';
    if (parentRoutes.some(route => currentPath.startsWith(route))) return 'parent';
    return 'counselor';
  }, [currentPath]);

  const getNavCls = ({ isActive }: { isActive: boolean }) => 
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground";

  const getDisabledCls = () => 
    "opacity-50 cursor-not-allowed pointer-events-none text-muted-foreground";

  const renderMenuItem = (item: typeof mainItems[0], allowedRole: UserRole) => {
    const isDisabled = currentRole !== allowedRole;
    
    if (isDisabled) {
      return (
        <SidebarMenuItem key={item.title}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md ${getDisabledCls()}`}>
                  <item.icon className="h-4 w-4" />
                  {open && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      <Lock className="h-3 w-3" />
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Available for {allowedRole === 'counselor' ? 'counselors' : allowedRole === 'student' ? 'students' : 'parents'} only</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink to={item.url} end className={getNavCls}>
            <item.icon className="h-4 w-4" />
            {open && (
              <>
                <span>{item.title}</span>
                {'badge' in item && item.badge && (
                  <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

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
                  <h1 className="font-bold text-foreground">The Primrose Review</h1>
                  <p className="text-xs text-muted-foreground">CRM Platform</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Navigation - Counselor */}
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              Counselor
              {currentRole === 'counselor' && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Active</Badge>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map(item => renderMenuItem(item, 'counselor'))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Student Portal Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              Student Portal
              {currentRole === 'student' && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Active</Badge>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {studentItems.map(item => renderMenuItem(item, 'student'))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Parent Portal Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              Parent Portal
              {currentRole === 'parent' && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Active</Badge>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {parentItems.map(item => renderMenuItem(item, 'parent'))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
      </Sidebar>
    </>
  );
}