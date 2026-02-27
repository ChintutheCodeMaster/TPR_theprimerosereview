import { useState } from "react";
import { StudentCard } from "@/components/StudentCard";
import { DashboardStats } from "@/components/DashboardStats";
import { CounselorInsights } from "@/components/CounselorInsights";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useIndexDashboard } from "@/hooks/useIndexDashboard";

const getStatusColor = (status: string) => {
  switch (status) {
    case "draft":       return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "in_progress": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "sent":        return "bg-green-500/10 text-green-600 border-green-500/20";
    default:            return "bg-muted text-muted-foreground";
  }
};

const Index = () => {
  const navigate = useNavigate();
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [essaysOpen, setEssaysOpen]     = useState(false);

  const {
    students,
    allStudents,
    essays,
    isLoadingStudents,
    isLoadingEssays,
  } = useIndexDashboard();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to The Primrose Review CRM
        </p>
      </div>

      <DashboardStats />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Students Needing Attention */}
        <Collapsible open={studentsOpen} onOpenChange={setStudentsOpen}>
          <Card className="p-6">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity gap-5">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  Students Needing Attention
                  <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {isLoadingStudents ? "…" : students.length}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/add-student");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                  {studentsOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-6">
              {isLoadingStudents ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">
                    {allStudents.length === 0
                      ? "No students assigned yet."
                      : "All students are on track! 🎉"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onViewStudent={(id) => navigate(`/students?id=${id}`)}
                    />
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Essays for Review */}
        <Collapsible open={essaysOpen} onOpenChange={setEssaysOpen}>
          <Card className="p-6">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  Essays for Review
                  <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {isLoadingEssays ? "…" : essays.length}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/essays");
                    }}
                  >
                    View All
                  </Button>
                  {essaysOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-6">
              {isLoadingEssays ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              ) : essays.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No essays pending review.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {essays.map((essay) => (
                    <div
                      key={essay.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate("/essays")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {essay.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {essay.studentName}
                          </p>
                          {essay.prompt && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {essay.prompt}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge className={getStatusColor(essay.status)}>
                            {essay.status.replace("_", " ")}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {essay.lastUpdated}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {essay.wordCount} words
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Counselor Insights */}
      <CounselorInsights />

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => navigate("/add-student")}
          >
            <Users className="h-6 w-6" />
            Add Student
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => navigate("/essays")}
          >
            <FileText className="h-6 w-6" />
            Review Essays
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => navigate("/check-deadlines")}
          >
            <Calendar className="h-6 w-6" />
            Check Deadlines
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => navigate("/view-reports")}
          >
            <TrendingUp className="h-6 w-6" />
            View Reports
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;