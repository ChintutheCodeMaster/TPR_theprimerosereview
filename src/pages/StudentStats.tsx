import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";

const StudentStats = () => {
  // Mock data for demo - your progress vs school average
  const myProgress = {
    essaysCompleted: 3,
    totalEssays: 5,
    applicationsSubmitted: 2,
    totalApplications: 8,
    recommendationLettersSent: 1,
    totalRecommendations: 3
  };

  const schoolAverages = {
    essaysCompletedPercent: 45,
    applicationsSubmittedPercent: 30,
    recommendationsPercent: 40
  };

  const myPercentages = {
    essays: Math.round((myProgress.essaysCompleted / myProgress.totalEssays) * 100),
    applications: Math.round((myProgress.applicationsSubmitted / myProgress.totalApplications) * 100),
    recommendations: Math.round((myProgress.recommendationLettersSent / myProgress.totalRecommendations) * 100)
  };

  const milestones = [
    { label: "Profile Completed", completed: true, date: "Nov 1, 2024" },
    { label: "First Essay Draft", completed: true, date: "Nov 15, 2024" },
    { label: "Common App Submitted", completed: false, dueDate: "Dec 20, 2024" },
    { label: "All Essays Finalized", completed: false, dueDate: "Jan 1, 2025" },
    { label: "Final Applications", completed: false, dueDate: "Jan 15, 2025" },
  ];

  const ComparisonBar = ({ 
    label, 
    myValue, 
    schoolValue, 
    icon: Icon 
  }: { 
    label: string; 
    myValue: number; 
    schoolValue: number; 
    icon: React.ElementType;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">{label}</span>
        </div>
        <div className="text-sm">
          <span className={myValue >= schoolValue ? "text-green-600 font-semibold" : "text-yellow-600 font-semibold"}>
            {myValue}%
          </span>
          <span className="text-muted-foreground"> vs </span>
          <span className="text-muted-foreground">{schoolValue}% avg</span>
        </div>
      </div>
      
      <div className="relative h-8 bg-secondary/50 rounded-lg overflow-hidden">
        {/* School average marker */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/50 z-10"
          style={{ left: `${schoolValue}%` }}
        />
        <div 
          className="absolute top-0 bottom-0 text-xs text-muted-foreground z-10 -translate-x-1/2"
          style={{ left: `${schoolValue}%`, top: '-20px' }}
        >
          School Avg
        </div>
        
        {/* My progress bar */}
        <div 
          className={`h-full transition-all duration-500 ${myValue >= schoolValue ? 'bg-green-500' : 'bg-yellow-500'}`}
          style={{ width: `${myValue}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          My Progress & Statistics
        </h1>
        <p className="text-muted-foreground">See how you compare with other students at your school</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {myProgress.essaysCompleted}/{myProgress.totalEssays}
          </p>
          <p className="text-muted-foreground">Essays Completed</p>
          {myPercentages.essays > schoolAverages.essaysCompletedPercent && (
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              Above Average
            </Badge>
          )}
        </Card>

        <Card className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {myProgress.applicationsSubmitted}/{myProgress.totalApplications}
          </p>
          <p className="text-muted-foreground">Applications Submitted</p>
          {myPercentages.applications < schoolAverages.applicationsSubmittedPercent && (
            <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-700">
              <Clock className="h-3 w-3 mr-1" />
              Keep Going!
            </Badge>
          )}
        </Card>

        <Card className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {myProgress.recommendationLettersSent}/{myProgress.totalRecommendations}
          </p>
          <p className="text-muted-foreground">Recommendations</p>
        </Card>
      </div>

      {/* Comparison Charts */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Your Progress vs School Average
        </h2>

        <div className="space-y-8">
          <ComparisonBar 
            label="Essays Completion"
            myValue={myPercentages.essays}
            schoolValue={schoolAverages.essaysCompletedPercent}
            icon={FileText}
          />
          
          <ComparisonBar 
            label="Applications Submitted"
            myValue={myPercentages.applications}
            schoolValue={schoolAverages.applicationsSubmittedPercent}
            icon={CheckCircle}
          />
          
          <ComparisonBar 
            label="Recommendations Ready"
            myValue={myPercentages.recommendations}
            schoolValue={schoolAverages.recommendationsPercent}
            icon={Users}
          />
        </div>
      </Card>

      {/* Milestones */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Application Milestones
        </h2>

        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div 
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg ${
                milestone.completed ? 'bg-green-50 border border-green-200' : 'bg-secondary/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                milestone.completed ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {milestone.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-medium ${milestone.completed ? 'text-green-700' : 'text-foreground'}`}>
                  {milestone.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {milestone.completed ? `Completed ${milestone.date}` : `Due: ${milestone.dueDate}`}
                </p>
              </div>
              
              {milestone.completed && (
                <Badge className="bg-green-500 text-white">Done</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StudentStats;
