import { useMemo } from "react";
import { GraduationCap, Users, FileText, Calendar, BarChart3, MessageSquare, Bell, UserCircle, BookOpen, Award, Home, PartyPopper } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

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
}, {
  title: "Messages",
  url: "/student-messages",
  icon: MessageSquare,
  badge: 3
}];

const parentItems = [{
  title: "Parent Portal",
  url: "/parent-portal",
  icon: Home
}, {
  title: "School Activities",
  url: "/school-activities",
  icon: PartyPopper
}];

// Routes that belong to each role
const counselorRoutes = ['/dashboard', '/students', '/essays', '/applications', '/recommendation-letters', '/messages', '/notifications', '/add-student', '/review-essays', '/check-deadlines', '/view-reports'];
const studentRoutes = ['/student-dashboard', '/student-personal-area', '/student-recommendation-letters', '/student-stats', '/submit-essay', '/add-application', '/student-messages'];
const parentRoutes = ['/parent-portal', '/school-activities'];

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

  const renderMenuItem = (item: typeof mainItems[0]) => (
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

          {currentRole === 'counselor' && (
            <SidebarGroup>
              <SidebarGroupLabel>Counselor</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainItems.map(item => renderMenuItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {currentRole === 'student' && (
            <SidebarGroup>
              <SidebarGroupLabel>Student Portal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {studentItems.map(item => renderMenuItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {currentRole === 'parent' && (
            <SidebarGroup>
              <SidebarGroupLabel>Parent Portal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {parentItems.map(item => renderMenuItem(item))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

        </SidebarContent>
      </Sidebar>
    </>
  );
}