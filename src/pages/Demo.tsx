import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Users, UserCircle, ArrowLeft, Eye } from "lucide-react";

const Demo = () => {
  const navigate = useNavigate();

  const demoOptions = [
    {
      role: 'counselor',
      icon: GraduationCap,
      title: 'Counselor View',
      description: 'Manage students, review essays, track applications',
      path: '/dashboard'
    },
    {
      role: 'student',
      icon: Users,
      title: 'Student View',
      description: 'Personal dashboard, essays, recommendations',
      path: '/student-dashboard'
    },
    {
      role: 'parent',
      icon: UserCircle,
      title: 'Parent View',
      description: 'Track child progress, contact counselor',
      path: '/parent-portal'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Button>

        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Eye className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Demo Mode</h1>
          <p className="text-muted-foreground">
            Explore the system with sample data. Choose a view to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoOptions.map((option) => (
            <Card 
              key={option.role}
              className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary group"
              onClick={() => navigate(option.path)}
            >
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <option.icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                </div>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  View Demo
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          All data shown is sample data for demonstration purposes only.
        </p>
      </div>
    </div>
  );
};

export default Demo;
