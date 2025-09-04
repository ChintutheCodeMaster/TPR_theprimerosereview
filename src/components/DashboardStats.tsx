import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export const DashboardStats = () => {
  const stats = [
    {
      title: "Total Students",
      value: "156",
      change: "+12",
      changeType: "positive" as const,
      icon: Users,
      color: "primary"
    },
    {
      title: "Essays in Review",
      value: "43",
      change: "+8",
      changeType: "positive" as const,
      icon: FileText,
      color: "secondary"
    },
    {
      title: "Upcoming Deadlines",
      value: "28",
      change: "this week",
      changeType: "neutral" as const,
      icon: Calendar,
      color: "warning"
    },
    {
      title: "At Risk Students",
      value: "7",
      change: "-3",
      changeType: "negative" as const,
      icon: AlertTriangle,
      color: "destructive"
    }
  ];

  const getIconBgColor = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-gradient-primary';
      case 'secondary': return 'bg-gradient-secondary';
      case 'warning': return 'bg-warning';
      case 'destructive': return 'bg-destructive';
      default: return 'bg-primary';
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title} 
            className="p-6 hover:shadow-card-hover transition-all duration-300 animate-fade-in group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {stat.value}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getChangeColor(stat.changeType)}`}
                  >
                    {stat.change}
                  </Badge>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${getIconBgColor(stat.color)} group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};