import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Users, 
  FileText, 
  Calendar, 
  BarChart3, 
  MessageSquare,
  Sparkles,
  Bell
} from "lucide-react";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Navigation = ({ activeView, onViewChange }: NavigationProps) => {
  const [notifications] = useState(3);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'essays', label: 'Essays', icon: FileText },
    { id: 'applications', label: 'Applications', icon: Calendar },
    { id: 'recommendations', label: 'Recommendations', icon: GraduationCap },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <nav className="bg-card border-r border-border shadow-card">
      <div className="flex flex-col h-full">
        {/* Logo and Title */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Primrose Review</h1>
              <p className="text-sm text-muted-foreground">CRM Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-primary text-primary-foreground shadow-card" 
                    : "hover:bg-card-hover text-foreground hover:text-primary"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {item.id === 'messages' && notifications > 0 && (
                  <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* AI Assistant */}
        <div className="p-4 border-t border-border">
          <Button 
            variant="outline"
            className="w-full justify-start gap-3 border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground hover:border-ai-accent"
          >
            <Sparkles className="h-5 w-5 text-ai-accent" />
            AI Assistant
          </Button>
        </div>

        {/* Notifications */}
        <div className="p-4">
          <Button 
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            Notifications
            {notifications > 0 && (
              <Badge variant="outline" className="ml-auto">
                {notifications}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};