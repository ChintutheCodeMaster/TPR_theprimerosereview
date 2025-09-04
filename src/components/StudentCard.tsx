import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  GraduationCap, 
  Clock, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface StudentCardProps {
  student: {
    id: string;
    name: string;
    avatar?: string;
    gpa: number;
    satScore?: number;
    completionPercentage: number;
    essaysSubmitted: number;
    totalEssays: number;
    upcomingDeadlines: number;
    status: 'on-track' | 'needs-attention' | 'at-risk';
    lastActivity: string;
  };
  onViewStudent: (id: string) => void;
}

export const StudentCard = ({ student, onViewStudent }: StudentCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'success';
      case 'needs-attention': return 'warning';
      case 'at-risk': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return CheckCircle;
      case 'needs-attention': return Clock;
      case 'at-risk': return AlertCircle;
      default: return User;
    }
  };

  const StatusIcon = getStatusIcon(student.status);

  return (
    <Card className="group hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] border-border bg-card animate-fade-in">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {student.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>GPA: {student.gpa}</span>
                {student.satScore && <span>SAT: {student.satScore}</span>}
              </div>
            </div>
          </div>
          <Badge 
            variant={getStatusColor(student.status) as any}
            className="flex items-center gap-1"
          >
            <StatusIcon className="h-3 w-3" />
            {student.status.replace('-', ' ')}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Application Progress</span>
            <span className="text-sm text-muted-foreground">{student.completionPercentage}%</span>
          </div>
          <Progress 
            value={student.completionPercentage} 
            className="h-2"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Essays</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {student.essaysSubmitted}/{student.totalEssays}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">Deadlines</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {student.upcomingDeadlines}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewStudent(student.id)}
          >
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground hover:border-ai-accent"
          >
            <Sparkles className="h-4 w-4 text-ai-accent" />
          </Button>
        </div>

        {/* Last Activity */}
        <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
          Last activity: {student.lastActivity}
        </p>
      </div>
    </Card>
  );
};