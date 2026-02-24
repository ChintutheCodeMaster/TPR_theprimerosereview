import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, GraduationCap, Users, UserCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const demoRoutes = [
  '/dashboard',
  '/students',
  '/essays',
  '/applications',
  '/recommendation-letters',
  '/messages',
  '/notifications',
  '/student-dashboard',
  '/student-personal-area',
  '/student-recommendation-letters',
  '/student-stats',
  '/parent-portal',
  '/add-student',
  '/review-essays',
  '/check-deadlines',
  '/view-reports'
];

export const DemoNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSwitching, setIsSwitching] = useState(false);

  if (!demoRoutes.includes(location.pathname)) {
    return null;
  }

  const isParentView = location.pathname === '/parent-portal';
  const isStudentView = location.pathname.startsWith('/student');
  const isCounselorView = !isParentView && !isStudentView;

  const handleSwitch = async (path: string) => {
    if (isSwitching) return;
    setIsSwitching(true);
    try {
      await supabase.auth.signOut();
      navigate(path);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-2 flex items-center gap-2">
        <span className="text-xs text-muted-foreground px-2">
          {isSwitching ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Switch Role:"
          )}
        </span>

        <Button
          size="sm"
          variant={isCounselorView ? "default" : "ghost"}
          className="gap-1 h-8"
          disabled={isSwitching}
          onClick={() => handleSwitch('/')}
        >
          <GraduationCap className="h-3 w-3" />
          <span className="hidden sm:inline">Counselor</span>
        </Button>

        <Button
          size="sm"
          variant={isStudentView ? "default" : "ghost"}
          className="gap-1 h-8"
          disabled={isSwitching}
          onClick={() => handleSwitch('/')}
        >
          <Users className="h-3 w-3" />
          <span className="hidden sm:inline">Student</span>
        </Button>

        <Button
          size="sm"
          variant={isParentView ? "default" : "ghost"}
          className="gap-1 h-8"
          disabled={isSwitching}
          onClick={() => handleSwitch('/')}
        >
          <UserCircle className="h-3 w-3" />
          <span className="hidden sm:inline">Parent</span>
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          size="sm"
          variant="outline"
          className="gap-1 h-8"
          disabled={isSwitching}
          onClick={() => handleSwitch('/demo')}
        >
          <Eye className="h-3 w-3" />
          <span className="hidden sm:inline">Demo Hub</span>
        </Button>
      </div>
    </div>
  );
};