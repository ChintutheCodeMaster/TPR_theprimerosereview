import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut,
  Sparkles
} from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-card border-b border-border shadow-card px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search and AI Assistant */}
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students, essays, or tasks..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button 
            variant="outline"
            size="sm"
            className="border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground hover:border-ai-accent group"
          >
            <Sparkles className="h-4 w-4 mr-2 text-ai-accent group-hover:text-primary-foreground" />
            Ask AI
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Dr. Sarah Chen</p>
              <p className="text-xs text-muted-foreground">College Counselor</p>
            </div>
            <Avatar className="h-8 w-8 border-2 border-primary/10">
              <AvatarImage src="/placeholder-user.jpg" alt="Dr. Sarah Chen" />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                SC
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};