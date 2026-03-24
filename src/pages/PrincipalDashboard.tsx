import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrincipalSchool } from "@/hooks/usePrincipalSchool";
import { usePrincipalStats } from "@/hooks/usePrincipalStats";
import {
  Users,
  FileText,
  BookOpen,
  Award,
  PartyPopper,
  Settings,
  Building2,
  Loader2,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: number | undefined;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center gap-4">
        <div className={`p-3 ${iconBg} rounded-xl`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {value === undefined ? (
            <Skeleton className="h-8 w-12 mt-1" />
          ) : (
            <p className="text-3xl font-bold text-foreground">{value}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const { data: school, isLoading: loadingSchool } = usePrincipalSchool();
  const { data: stats, isLoading: loadingStats } = usePrincipalStats();

  if (loadingSchool) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {school?.schoolName ?? "School Overview"}
        </h1>
        <p className="text-muted-foreground mt-1">
          School-wide dashboard — high-level snapshot
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={loadingStats ? undefined : stats?.totalStudents}
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          title="Counselors"
          value={loadingStats ? undefined : stats?.totalCounselors}
          icon={Building2}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Essays Submitted"
          value={loadingStats ? undefined : stats?.totalEssays}
          icon={FileText}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Applications"
          value={loadingStats ? undefined : stats?.totalApplications}
          icon={BookOpen}
          iconBg="bg-green-500/10"
          iconColor="text-green-600"
        />
        <StatCard
          title="Rec Letters"
          value={loadingStats ? undefined : stats?.totalRecLetters}
          icon={Award}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => navigate("/principal-students")}
          >
            <Users className="h-6 w-6" />
            Student Roster
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => navigate("/principal-counselors")}
          >
            <Building2 className="h-6 w-6" />
            Counselors
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => navigate("/principal-activities")}
          >
            <PartyPopper className="h-6 w-6" />
            Activities
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => navigate("/principal-settings")}
          >
            <Settings className="h-6 w-6" />
            School Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PrincipalDashboard;
