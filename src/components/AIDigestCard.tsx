import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface AIPriority {
  type: 'critical' | 'important' | 'informational';
  title: string;
  description: string;
  action: string;
}

interface AIDigestCardProps {
  summary: string;
  priorities: AIPriority[];
}

export const AIDigestCard = ({ summary, priorities }: AIDigestCardProps) => {
  return (
    <Card className="border-ai-accent/20 bg-gradient-to-r from-ai-accent/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-ai-accent" />
          AI Daily Digest
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground font-medium">{summary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorities.map((priority, index) => (
            <Card key={index} className="bg-background/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Badge 
                    variant={priority.type === 'critical' ? 'destructive' : 'secondary'}
                    className="mt-1"
                  >
                    {priority.type}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{priority.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{priority.description}</p>
                    <p className="text-xs font-medium text-ai-accent mt-2">{priority.action}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
