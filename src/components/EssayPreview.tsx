import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Edit, 
  Eye, 
  Sparkles, 
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface EssayPreviewProps {
  essay: {
    id: string;
    title: string;
    studentName: string;
    prompt: string;
    wordCount: number;
    targetWords: number;
    status: 'draft' | 'review' | 'approved' | 'needs-revision';
    aiScore: number;
    lastUpdated: string;
    dueDate: string;
  };
  onViewEssay: (id: string) => void;
}

export const EssayPreview = ({ essay, onViewEssay }: EssayPreviewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'review': return 'warning';
      case 'needs-revision': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'review': return Clock;
      case 'needs-revision': return AlertCircle;
      default: return FileText;
    }
  };

  const StatusIcon = getStatusIcon(essay.status);
  const wordProgress = (essay.wordCount / essay.targetWords) * 100;

  return (
    <Card className="group hover:shadow-card-hover transition-all duration-300 border-border bg-card animate-fade-in">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
              {essay.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              by {essay.studentName}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {essay.prompt}
            </p>
          </div>
          <Badge 
            variant={getStatusColor(essay.status) as any}
            className="flex items-center gap-1 ml-4"
          >
            <StatusIcon className="h-3 w-3" />
            {essay.status.replace('-', ' ')}
          </Badge>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3 mb-4">
          {/* Word Count Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground">Word Count</span>
              <span className="text-xs text-muted-foreground">
                {essay.wordCount}/{essay.targetWords} words
              </span>
            </div>
            <Progress 
              value={Math.min(wordProgress, 100)} 
              className="h-1.5"
            />
          </div>

          {/* AI Quality Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-ai-accent" />
                <span className="text-xs font-medium text-foreground">AI Quality Score</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {essay.aiScore}/100
              </span>
            </div>
            <Progress 
              value={essay.aiScore} 
              className="h-1.5"
            />
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Due: {essay.dueDate}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewEssay(essay.id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Review
          </Button>
          <Button 
            variant="outline" 
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground hover:border-ai-accent"
          >
            <Sparkles className="h-4 w-4 text-ai-accent" />
          </Button>
        </div>

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
          Last updated: {essay.lastUpdated}
        </p>
      </div>
    </Card>
  );
};