import { useState } from "react";
import { StudentCard } from "@/components/StudentCard";
import { DashboardStats } from "@/components/DashboardStats";
import { CounselorInsights } from "@/components/CounselorInsights";
import { EssayPreview } from "@/components/EssayPreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Plus, Users, FileText, Calendar, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Index = () => {
  const navigate = useNavigate();
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [essaysOpen, setEssaysOpen] = useState(false);

  // Mock data for demonstration
  const mockStudents = [
    {
      id: '1',
      name: 'Emma Rodriguez',
      gpa: 3.8,
      satScore: 1450,
      completionPercentage: 75,
      essaysSubmitted: 3,
      totalEssays: 5,
      upcomingDeadlines: 2,
      status: 'on-track' as const,
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Michael Chen',
      gpa: 4.0,
      satScore: 1520,
      completionPercentage: 45,
      essaysSubmitted: 2,
      totalEssays: 6,
      upcomingDeadlines: 4,
      status: 'needs-attention' as const,
      lastActivity: '1 day ago'
    },
    {
      id: '3',
      name: 'Sofia Johnson',
      gpa: 3.6,
      satScore: 1380,
      completionPercentage: 20,
      essaysSubmitted: 1,
      totalEssays: 4,
      upcomingDeadlines: 6,
      status: 'at-risk' as const,
      lastActivity: '3 days ago'
    }
  ];

  const mockEssays = [
    {
      id: '1',
      title: 'Common App Personal Statement',
      studentName: 'Emma Rodriguez',
      prompt: 'Some students have a background, identity, interest, or talent...',
      wordCount: 520,
      targetWords: 650,
      status: 'review' as const,
      aiScore: 78,
      lastUpdated: '2 hours ago',
      dueDate: 'Nov 15, 2024'
    },
    {
      id: '2',
      title: 'Harvard Supplemental Essay',
      studentName: 'Michael Chen',
      prompt: 'Briefly describe an intellectual experience...',
      wordCount: 450,
      targetWords: 500,
      status: 'approved' as const,
      aiScore: 92,
      lastUpdated: '1 day ago',
      dueDate: 'Dec 1, 2024'
    }
  ];

  const handleViewStudent = (id: string) => {
    console.log('Viewing student:', id);
  };

  const handleViewEssay = (id: string) => {
    console.log('Viewing essay:', id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to The Primrose Review CRM</p>
      </div>

      <DashboardStats />
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students Needing Attention */}
        <Collapsible open={studentsOpen} onOpenChange={setStudentsOpen}>
          <Card className="p-6">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  Students Needing Attention
                  <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {mockStudents.length}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/add-student');
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
              <div className="space-y-4">
                {mockStudents.map((student) => (
                  <StudentCard 
                    key={student.id} 
                    student={student} 
                    onViewStudent={handleViewStudent}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Recent Essays */}
        <Collapsible open={essaysOpen} onOpenChange={setEssaysOpen}>
          <Card className="p-6">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  Essays for Review
                  <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {mockEssays.length}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/review-essays');
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
              <div className="space-y-4">
                {mockEssays.map((essay) => (
                  <EssayPreview 
                    key={essay.id} 
                    essay={essay} 
                    onViewEssay={handleViewEssay}
                  />
                ))}
              </div>
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
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/add-student')}>
            <Users className="h-6 w-6" />
            Add Student
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/review-essays')}>
            <FileText className="h-6 w-6" />
            Review Essays
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/check-deadlines')}>
            <Calendar className="h-6 w-6" />
            Check Deadlines
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate('/view-reports')}>
            <TrendingUp className="h-6 w-6" />
            View Reports
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;