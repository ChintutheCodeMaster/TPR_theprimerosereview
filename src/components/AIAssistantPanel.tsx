import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X,
  Send,
  Sparkles,
  User,
  Calendar,
  MessageSquare,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  ExternalLink,
  Plus,
  Bot,
  Lightbulb,
  Target,
  TrendingUp
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    type: 'link' | 'task' | 'message';
    target?: string;
    data?: any;
  }>;
  urgentItems?: Array<{
    type: 'deadline' | 'missing' | 'overdue';
    text: string;
    studentName?: string;
    link?: string;
  }>;
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickActions = [
  {
    id: 'pre-meeting',
    title: 'Pre-Meeting Brief',
    description: 'Get student summary before meeting',
    icon: User,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'deadlines',
    title: 'Deadlines This Week',
    description: 'Critical upcoming deadlines',
    icon: Calendar,
    color: 'bg-red-100 text-red-700'
  },
  {
    id: 'draft-reminder',
    title: 'Draft Reminder',
    description: 'Generate message for student/parent',
    icon: MessageSquare,
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'essay-feedback',
    title: 'Essay Feedback Summary',
    description: 'Recent AI review notes',
    icon: FileText,
    color: 'bg-purple-100 text-purple-700'
  }
];

const mockStudents = [
  'Emma Thompson',
  'Marcus Johnson', 
  'Sophia Chen',
  'Alex Rivera'
];

export const AIAssistantPanel = ({ isOpen, onClose }: AIAssistantPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hi! I\'m here to help you manage your students and applications. You can ask me about deadlines, student progress, or use the quick actions above.',
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'pre-meeting':
        if (!selectedStudent) return;
        const briefResponse: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `## Pre-Meeting Brief: ${selectedStudent}\n\n**Academic Performance**\n• GPA: 3.8/4.0\n• SAT Score: 1450\n• Current rank: Top 10%\n\n**Application Progress**\n• 3 of 5 essays completed\n• 2 recommendation letters submitted\n• MIT application: 85% complete\n\n**Recent Activity**\n• Submitted Common App essay revision yesterday\n• Scheduled meeting for Stanford application review\n\n**Action Items**\n• Review supplemental essay drafts\n• Follow up on missing recommendation letter\n• Discuss timeline for remaining applications`,
          timestamp: 'Just now',
          actions: [
            { label: 'View Student Profile', type: 'link', target: '/students' },
            { label: 'Review Essays', type: 'link', target: '/essays' },
            { label: 'Send Reminder', type: 'message', data: { student: selectedStudent } }
          ]
        };
        setMessages(prev => [...prev, briefResponse]);
        break;

      case 'deadlines':
        const deadlinesResponse: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `## Critical Deadlines This Week\n\n**Tomorrow (High Priority)**\n• MIT Early Action - Marcus Johnson\n• Stanford REA - Emma Thompson\n\n**This Week**\n• UC Berkeley - 3 students\n• Harvard EA - 2 students\n\n**Missing Materials**\n• 5 essays still in draft\n• 3 recommendation letters pending`,
          timestamp: 'Just now',
          urgentItems: [
            { type: 'deadline', text: 'MIT application due tomorrow', studentName: 'Marcus Johnson', link: '/applications' },
            { type: 'missing', text: '2 essays missing for Stanford', studentName: 'Emma Thompson', link: '/essays' },
            { type: 'overdue', text: 'Recommendation letter overdue', studentName: 'Alex Rivera', link: '/recommendations' }
          ],
          actions: [
            { label: 'View All Applications', type: 'link', target: '/applications' },
            { label: 'Send Deadline Reminders', type: 'message' }
          ]
        };
        setMessages(prev => [...prev, deadlinesResponse]);
        break;

      case 'draft-reminder':
        const reminderResponse: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `## Draft Reminder Message\n\n**Suggested Message:**\n\n"Hi ${selectedStudent || '[Student Name]'}! Just a friendly reminder that your Stanford supplemental essays are due this Friday. I've reviewed your Common App essay and it looks great! \n\nFor the Stanford essays, remember to:\n• Focus on specific experiences\n• Show your personality\n• Connect to your goals\n\nLet me know if you need any help or want to schedule a review session!\n\nBest,\nMs. Johnson"`,
          timestamp: 'Just now',
          actions: [
            { label: 'Send Message', type: 'message' },
            { label: 'Edit & Send', type: 'message' },
            { label: 'Schedule Meeting', type: 'task' }
          ]
        };
        setMessages(prev => [...prev, reminderResponse]);
        break;

      case 'essay-feedback':
        const feedbackResponse: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: `## Recent Essay Feedback Summary\n\n**Emma Thompson - Common App Essay**\n• AI Score: 85/100\n• Strengths: Strong narrative voice, clear theme\n• Areas for improvement: Conclusion needs strengthening\n• Status: Ready for final review\n\n**Marcus Johnson - MIT Essay**\n• AI Score: 72/100\n• Strengths: Technical knowledge evident\n• Areas for improvement: More personal connection needed\n• Status: Requires revision\n\n**Top Priority Reviews**\n• 3 essays waiting for counselor feedback\n• 2 essays overdue for student revisions`,
          timestamp: 'Just now',
          actions: [
            { label: 'Review Essays', type: 'link', target: '/essays' },
            { label: 'Send Feedback', type: 'message' }
          ]
        };
        setMessages(prev => [...prev, feedbackResponse]);
        break;
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: 'Just now'
    };

    // Simulate AI response
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: `I understand you're asking about "${inputMessage}". Here's what I found:\n\n**Summary**\n• Based on current data across your students\n• Analyzing applications, essays, and deadlines\n• Providing actionable insights\n\nFor more specific help, try using the quick actions above or ask about a particular student or deadline.`,
      timestamp: 'Just now',
      actions: [
        { label: 'View Dashboard', type: 'link', target: '/' },
        { label: 'Get More Details', type: 'task' }
      ]
    };

    setMessages(prev => [...prev, userMessage, aiResponse]);
    setInputMessage("");
  };

  const createTask = (action: any) => {
    // Simulate creating a task
    alert(`Task created: ${action.label}`);
  };

  const openLink = (target: string) => {
    // In a real app, this would navigate to the target page
    console.log(`Navigating to: ${target}`);
  };

  const sendInstantMessage = (action: any) => {
    // Simulate sending a message
    alert(`Message sent: ${action.label}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div 
        className="flex-1 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="w-96 bg-background border-l border-border shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">Powered by Primrose AI</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
          
          {/* Student Selector for certain actions */}
          <div className="mb-3">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select student for personalized actions" />
              </SelectTrigger>
              <SelectContent>
                {mockStudents.map((student) => (
                  <SelectItem key={student} value={student}>
                    {student}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center gap-2"
                  onClick={() => handleQuickAction(action.id)}
                  disabled={
                    (action.id === 'pre-meeting' || action.id === 'draft-reminder') && 
                    !selectedStudent
                  }
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'ai' && (
                  <Avatar className="h-8 w-8 border-2 border-ai-accent/20">
                    <AvatarFallback className="bg-gradient-ai text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Urgent Items */}
                    {message.urgentItems && message.urgentItems.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.urgentItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-background/80 rounded">
                            {item.type === 'deadline' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                            {item.type === 'missing' && <Clock className="h-4 w-4 text-warning" />}
                            {item.type === 'overdue' && <AlertTriangle className="h-4 w-4 text-destructive" />}
                            <span className="text-xs flex-1">{item.text}</span>
                            {item.studentName && (
                              <Badge variant="outline" className="text-xs">
                                {item.studentName}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => {
                              switch (action.type) {
                                case 'link':
                                  openLink(action.target || '/');
                                  break;
                                case 'task':
                                  createTask(action);
                                  break;
                                case 'message':
                                  sendInstantMessage(action);
                                  break;
                              }
                            }}
                          >
                            {action.type === 'link' && <ExternalLink className="h-3 w-3 mr-1" />}
                            {action.type === 'task' && <Plus className="h-3 w-3 mr-1" />}
                            {action.type === 'message' && <Send className="h-3 w-3 mr-1" />}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {message.timestamp}
                  </p>
                </div>
                
                {message.type === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask about students, deadlines, essays..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <Lightbulb className="h-3 w-3 text-ai-accent" />
              </Button>
            </div>
            <Button 
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="bg-gradient-ai hover:bg-gradient-ai/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses are based on your current student data
          </p>
        </div>
      </div>
    </div>
  );
};