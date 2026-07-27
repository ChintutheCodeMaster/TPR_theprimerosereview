import { useState } from "react";
import { GraduationCap, BarChart3, UserCircle, Star, Zap, FlaskConical, Trophy, Calculator, ChevronDown, ChevronRight, Sparkles, Mic } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, useSidebar } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
  tourId?: string;
}

const studentTopItems: NavItem[] = [{
  title: "Student Dashboard",
  url: "/student-dashboard",
  icon: UserCircle,
  tourId: "tour-nav-dashboard",
}];

const studentBottomItems: NavItem[] = [{
  title: "My Profile",
  url: "/student-profile",
  icon: UserCircle,
}];

const essayJourneySteps: (NavItem & { step: number })[] = [
  { step: 1, title: "Primrose Lab", url: "/primrose-lab", icon: FlaskConical },
  { step: 2, title: "Evaluation Engine", url: "/evaluation-engine", icon: Zap },
  { step: 3, title: "Submit Essay", url: "/student-personal-area", icon: Sparkles, tourId: "tour-nav-my-work" },
];

const additionalToolItems: NavItem[] = [
  { title: "Eva - Admissions Coach", url: "/interview-simulator", icon: Mic },
  { title: "The Primrose Challenge", url: "/weekly-challenge", icon: Trophy },
  { title: "Scholarship Finder", url: "/scholarship-finder", icon: Star },
  { title: "Study Cost Planner", url: "/tuition-calculator", icon: Calculator },
  { title: "My Stats", url: "/student-stats", icon: BarChart3, tourId: "tour-nav-stats" },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ additional: false });

  const toggleSection = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-white/[0.06] text-foreground hairline"
      : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground";

  const renderMenuItem = (item: NavItem) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end
          className={getNavCls}
          id={item.tourId}
        >
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
  );

  return (
    <Sidebar className={`${open ? "w-64" : "w-16"} hairline-r bg-background`} variant="sidebar">
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-4 hairline-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg hairline bg-white/[0.03] flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-foreground/80" />
            </div>
            {open && (
              <div>
                <h1 className="font-serif text-lg text-foreground leading-none">The Primrose Review</h1>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Student Platform</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Student Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studentTopItems.map(item => renderMenuItem(item))}
              {open && (
                <div className="px-2 pt-3 pb-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Essay Journey</p>
                </div>
              )}
              {essayJourneySteps.map(step => (
                <SidebarMenuItem key={step.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={step.url} end className={getNavCls} id={step.tourId}>
                      {open ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full hairline bg-white/[0.03] text-[11px] font-medium text-muted-foreground">
                          {step.step}
                        </span>
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                      {open && <span>{step.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {studentBottomItems.map(item => renderMenuItem(item))}
              <Collapsible open={openSections["additional"]} onOpenChange={() => toggleSection("additional")}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full">
                      <Trophy className="h-4 w-4 shrink-0" />
                      {open && (
                        <>
                          <span className="flex-1 text-left">Additional Tools</span>
                          {openSections["additional"]
                            ? <ChevronDown className="h-3.5 w-3.5 ml-auto" />
                            : <ChevronRight className="h-3.5 w-3.5 ml-auto" />}
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {additionalToolItems.map(item => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink to={item.url} end className={getNavCls}>
                              <item.icon className="h-4 w-4" />
                              {open && <span>{item.title}</span>}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
