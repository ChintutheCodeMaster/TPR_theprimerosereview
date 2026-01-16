import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Bell,
  BellOff,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  MessageSquare,
  Calendar,
  User,
  School,
  Send,
  Eye,
  EyeOff,
  Trash2,
  TrendingUp,
  Archive,
  MoreHorizontal,
  Play,
  Pause,
  X
} from "lucide-react";

interface Notification {
  id: string;
  type: 'essay' | 'application' | 'recommendation' | 'task' | 'message' | 'deadline';
  priority: 'critical' | 'important' | 'informational';
  title: string;
  description: string;
  studentName: string;
  studentId: string;
  studentAvatar?: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  linkedPage?: string;
  linkedId?: string;
  snoozed?: boolean;
  snoozeUntil?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'deadline',
    priority: 'critical',
    title: 'Application Deadline Tomorrow',
    description: 'MIT application due tomorrow - missing 2 essays',
    studentName: 'Marcus Johnson',
    studentId: 'st2',
    timestamp: '2 hours ago',
    read: false,
    actionable: true,
    linkedPage: '/applications',
    linkedId: 'app2'
  },
  {
    id: '2',
    type: 'essay',
    priority: 'important',
    title: 'New Essay Draft Submitted',
    description: 'Common App Personal Statement - 3rd revision ready for review',
    studentName: 'Emma Thompson',
    studentId: 'st1',
    timestamp: '4 hours ago',
    read: false,
    actionable: true,
    linkedPage: '/essays',
    linkedId: 'essay1'
  },
  {
    id: '3',
    type: 'recommendation',
    priority: 'important',
    title: 'Recommendation Letter Overdue',
    description: 'Mr. Smith hasn\'t submitted letter for Stanford application',
    studentName: 'Emma Thompson',
    studentId: 'st1',
    timestamp: '6 hours ago',
    read: true,
    actionable: true,
    linkedPage: '/recommendation-letters',
    linkedId: 'rec1'
  },
  {
    id: '4',
    type: 'message',
    priority: 'informational',
    title: 'New Message from Parent',
    description: 'Sarah Thompson: "When is the next meeting scheduled?"',
    studentName: 'Emma Thompson',
    studentId: 'st1',
    timestamp: '1 day ago',
    read: true,
    actionable: true,
    linkedPage: '/messages',
    linkedId: 'conv1'
  },
  {
    id: '5',
    type: 'task',
    priority: 'important',
    title: 'Task Completed',
    description: 'Essay revision completed - ready for final review',
    studentName: 'Sophia Chen',
    studentId: 'st3',
    timestamp: '2 days ago',
    read: true,
    actionable: false
  },
  {
    id: '6',
    type: 'application',
    priority: 'critical',
    title: 'Application Status Update',
    description: 'Johns Hopkins application submitted successfully',
    studentName: 'Sophia Chen',
    studentId: 'st3',
    timestamp: '3 days ago',
    read: true,
    actionable: false
  },
  {
    id: '7',
    type: 'deadline',
    priority: 'important',
    title: 'Upcoming Deadlines This Week',
    description: '5 students have applications due within 7 days',
    studentName: 'Multiple Students',
    studentId: 'multiple',
    timestamp: '1 week ago',
    read: false,
    actionable: true,
    linkedPage: '/applications'
  }
];

const dailyDigest = {
  summary: "You have 3 critical items requiring immediate attention today",
  priorities: [
    {
      type: 'critical',
      title: 'MIT Application Due Tomorrow',
      description: 'Marcus Johnson is missing 2 essays for tomorrow\'s deadline',
      action: 'Contact student immediately'
    },
    {
      type: 'important',
      title: '5 Essays Awaiting Review',
      description: 'Emma Thompson and 4 others have submitted drafts',
      action: 'Schedule review session'
    },
    {
      type: 'important',
      title: '3 Overdue Recommendations',
      description: 'Follow up with teachers for pending letters',
      action: 'Send reminder emails'
    }
  ]
};

const Notifications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [showRead, setShowRead] = useState(true);
  const [notifications, setNotifications] = useState(mockNotifications);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'important': return 'warning';
      case 'informational': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return AlertTriangle;
      case 'important': return AlertCircle;
      case 'informational': return Bell;
      default: return Bell;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'essay': return FileText;
      case 'application': return School;
      case 'recommendation': return User;
      case 'task': return CheckCircle;
      case 'message': return MessageSquare;
      case 'deadline': return Calendar;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'essay': return 'bg-blue-100 text-blue-700';
      case 'application': return 'bg-green-100 text-green-700';
      case 'recommendation': return 'bg-purple-100 text-purple-700';
      case 'task': return 'bg-orange-100 text-orange-700';
      case 'message': return 'bg-cyan-100 text-cyan-700';
      case 'deadline': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    const matchesStudent = studentFilter === 'all' || notification.studentId === studentFilter;
    const matchesRead = showRead || !notification.read;
    
    return matchesSearch && matchesType && matchesPriority && matchesStudent && matchesRead && !notification.snoozed;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const snoozeNotification = (id: string, hours: number = 24) => {
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + hours);
    
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { 
          ...notif, 
          snoozed: true, 
          snoozeUntil: snoozeUntil.toISOString() 
        } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read && !n.snoozed).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read && !n.snoozed).length;
  const snoozedCount = notifications.filter(n => n.snoozed).length;

  const uniqueStudents = Array.from(new Set(notifications.map(n => n.studentName).filter(name => name !== 'Multiple Students')));

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on all student progress and deadlines</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive Old
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Notifications</p>
                <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <BellOff className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Clock className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Snoozed</p>
                <p className="text-2xl font-bold text-foreground">{snoozedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Digest */}
      <Card className="border-primary/20 bg-gradient-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Daily Digest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground font-medium">{dailyDigest.summary}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailyDigest.priorities.map((priority, index) => (
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
                      <p className="text-xs font-medium text-primary mt-2">{priority.action}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="essay">Essays</SelectItem>
                  <SelectItem value="application">Applications</SelectItem>
                  <SelectItem value="recommendation">Recommendations</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="message">Messages</SelectItem>
                  <SelectItem value="deadline">Deadlines</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="informational">Informational</SelectItem>
                </SelectContent>
              </Select>

              <Select value={studentFilter} onValueChange={setStudentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {uniqueStudents.map((student) => (
                    <SelectItem key={student} value={student}>
                      {student}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant={showRead ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowRead(!showRead)}
              >
                {showRead ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Timeline */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const TypeIcon = getTypeIcon(notification.type);
            const PriorityIcon = getPriorityIcon(notification.priority);
            
            return (
              <Card 
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                } ${
                  notification.priority === 'critical' ? 'border-destructive/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Priority & Type Indicator */}
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <Badge variant={getPriorityColor(notification.priority) as any} className="text-xs">
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {notification.priority}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.description}
                          </p>
                          
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {notification.studentName !== 'Multiple Students' && (
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={notification.studentAvatar} alt={notification.studentName} />
                                  <AvatarFallback className="text-xs">
                                    {notification.studentName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <span>{notification.studentName}</span>
                            </div>
                            <span>•</span>
                            <span>{notification.timestamp}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs capitalize">
                              {notification.type}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-4">
                          {notification.actionable && (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              
                              {notification.type === 'essay' && (
                                <Button variant="outline" size="sm">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Review
                                </Button>
                              )}
                              
                              {notification.type === 'message' && (
                                <Button variant="outline" size="sm">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Reply
                                </Button>
                              )}
                              
                              {(notification.type === 'deadline' || notification.type === 'recommendation') && (
                                <Button variant="outline" size="sm">
                                  <Send className="h-3 w-3 mr-1" />
                                  Remind
                                </Button>
                              )}
                            </>
                          )}
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm">
                              <DialogHeader>
                                <DialogTitle>Notification Actions</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                {!notification.read && (
                                  <Button 
                                    variant="outline" 
                                    className="w-full justify-start"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Read
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-start"
                                  onClick={() => snoozeNotification(notification.id, 24)}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Snooze for 24h
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-start"
                                  onClick={() => snoozeNotification(notification.id, 168)}
                                >
                                  <Pause className="h-4 w-4 mr-2" />
                                  Snooze for 1 week
                                </Button>
                                
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-start text-destructive hover:text-destructive"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;