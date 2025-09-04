import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";
import { DashboardStats } from "@/components/DashboardStats";
import { StudentCard } from "@/components/StudentCard";
import { EssayPreview } from "@/components/EssayPreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Users, FileText, Calendar, TrendingUp } from "lucide-react";

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

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

  const renderDashboard = () => (
    <div className="space-y-8">
      <DashboardStats />
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Students Needing Attention */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Students Needing Attention
            </h2>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
          <div className="space-y-4">
            {mockStudents.map((student) => (
              <StudentCard 
                key={student.id} 
                student={student} 
                onViewStudent={handleViewStudent}
              />
            ))}
          </div>
        </div>

        {/* Recent Essays */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Essays for Review
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {mockEssays.map((essay) => (
              <EssayPreview 
                key={essay.id} 
                essay={essay} 
                onViewEssay={handleViewEssay}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Users className="h-6 w-6" />
            Add Student
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <FileText className="h-6 w-6" />
            Review Essays
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Calendar className="h-6 w-6" />
            Check Deadlines
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <TrendingUp className="h-6 w-6" />
            View Reports
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 min-h-screen">
          <Navigation activeView={activeView} onViewChange={setActiveView} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Header />
          <main className="p-8">
            {activeView === 'dashboard' && renderDashboard()}
            {activeView !== 'dashboard' && (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1)} View
                </h2>
                <p className="text-muted-foreground">
                  This section is coming soon. The dashboard shows the core functionality.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
