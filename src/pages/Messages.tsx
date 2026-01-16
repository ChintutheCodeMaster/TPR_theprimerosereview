import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  Send,
  Paperclip,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  User,
  Users,
  Mail,
  Bell,
  Plus,
  FileText,
  Calendar,
  Lightbulb,
  MoreHorizontal,
  ChevronDown,
  Pin,
  Archive,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'counselor' | 'student' | 'parent';
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: { name: string; type: string; url: string }[];
}

interface Conversation {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  parentName?: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'urgent' | 'archived';
  messages: Message[];
  tags: string[];
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    studentId: 'st1',
    studentName: 'Emma Thompson',
    parentName: 'Sarah Thompson',
    participants: ['Emma Thompson', 'Sarah Thompson'],
    lastMessage: 'Thanks for the essay feedback! I\'ll work on the conclusion.',
    lastMessageTime: '2 hours ago',
    unreadCount: 0,
    status: 'active',
    tags: ['essays', 'feedback'],
    messages: [
      {
        id: 'm1',
        senderId: 'counselor',
        senderName: 'Ms. Johnson',
        senderRole: 'counselor',
        content: 'Hi Emma! I\'ve reviewed your Common App essay. Overall it\'s very strong - I love how you\'ve woven your debate experience throughout. A few suggestions: consider strengthening your conclusion to better tie back to your opening hook, and add one more specific example in paragraph 3.',
        timestamp: '3 hours ago',
        read: true,
        attachments: [
          { name: 'essay_feedback.pdf', type: 'pdf', url: '#' }
        ]
      },
      {
        id: 'm2',
        senderId: 'st1',
        senderName: 'Emma Thompson',
        senderRole: 'student',
        content: 'Thanks for the essay feedback! I\'ll work on the conclusion.',
        timestamp: '2 hours ago',
        read: true
      }
    ]
  },
  {
    id: '2',
    studentId: 'st2',
    studentName: 'Marcus Johnson',
    parentName: 'Robert Johnson',
    participants: ['Marcus Johnson', 'Robert Johnson'],
    lastMessage: 'When is the next meeting scheduled?',
    lastMessageTime: '1 day ago',
    unreadCount: 2,
    status: 'urgent',
    tags: ['deadlines', 'urgent'],
    messages: [
      {
        id: 'm3',
        senderId: 'parent',
        senderName: 'Robert Johnson',
        senderRole: 'parent',
        content: 'Hi Ms. Johnson, we\'re concerned about Marcus\'s application deadlines. Can we schedule a meeting this week?',
        timestamp: '1 day ago',
        read: false
      },
      {
        id: 'm4',
        senderId: 'st2',
        senderName: 'Marcus Johnson',
        senderRole: 'student',
        content: 'When is the next meeting scheduled?',
        timestamp: '1 day ago',
        read: false
      }
    ]
  },
  {
    id: '3',
    studentId: 'st3',
    studentName: 'Sophia Chen',
    parentName: 'Linda Chen',
    participants: ['Sophia Chen', 'Linda Chen'],
    lastMessage: 'Perfect! See you then.',
    lastMessageTime: '3 days ago',
    unreadCount: 0,
    status: 'active',
    tags: ['meetings'],
    messages: [
      {
        id: 'm5',
        senderId: 'counselor',
        senderName: 'Ms. Johnson',
        senderRole: 'counselor',
        content: 'Great news! Your Johns Hopkins application has been submitted successfully. Let\'s meet next week to discuss your remaining applications.',
        timestamp: '3 days ago',
        read: true
      },
      {
        id: 'm6',
        senderId: 'st3',
        senderName: 'Sophia Chen',
        senderRole: 'student',
        content: 'Perfect! See you then.',
        timestamp: '3 days ago',
        read: true
      }
    ]
  }
];

const messageTemplates = [
  {
    id: 'deadline',
    title: 'Deadline Reminder',
    template: 'Hi {studentName}! This is a friendly reminder that your {applicationName} application is due on {deadline}. Let me know if you need any help finalizing your materials.'
  },
  {
    id: 'essay-feedback',
    title: 'Essay Feedback Summary',
    template: 'Hi {studentName}! I\'ve reviewed your {essayTitle} essay. Overall impressions: {feedback}. Please review the attached comments and let\'s discuss any questions you have.'
  },
  {
    id: 'recommendation',
    title: 'Recommendation Status',
    template: 'Hi {studentName}! Update on your recommendation letters: {status}. {nextSteps}'
  },
  {
    id: 'meeting',
    title: 'Meeting Reminder',
    template: 'Hi {studentName}! Looking forward to our meeting on {date} at {time}. We\'ll be discussing: {agenda}. Please bring any questions you have!'
  }
];

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [showAITemplates, setShowAITemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState("");

  const filteredConversations = mockConversations.filter(conv => {
    const matchesSearch = conv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (conv.parentName && conv.parentName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    switch (filter) {
      case 'students':
        return matchesSearch && conv.participants.includes(conv.studentName);
      case 'parents':
        return matchesSearch && conv.parentName && conv.participants.includes(conv.parentName);
      case 'unread':
        return matchesSearch && conv.unreadCount > 0;
      case 'urgent':
        return matchesSearch && conv.status === 'urgent';
      default:
        return matchesSearch;
    }
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'counselor': return 'bg-primary text-primary-foreground';
      case 'student': return 'bg-secondary text-secondary-foreground';
      case 'parent': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const generateTemplateMessage = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId);
    if (!template || !selectedConversation) return;

    let message = template.template;
    message = message.replace('{studentName}', selectedConversation.studentName);
    
    // Add placeholder replacements
    message = message.replace('{applicationName}', 'Stanford University');
    message = message.replace('{deadline}', 'January 15th');
    message = message.replace('{essayTitle}', 'Personal Statement');
    message = message.replace('{feedback}', 'Strong storytelling with room for improvement in conclusion');
    message = message.replace('{status}', '2 of 3 letters submitted');
    message = message.replace('{nextSteps}', 'Following up with remaining recommender');
    message = message.replace('{date}', 'next Friday');
    message = message.replace('{time}', '3:00 PM');
    message = message.replace('{agenda}', 'review applications, discuss deadlines');

    setNewMessage(message);
    setShowAITemplates(false);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `m${Date.now()}`,
      senderId: 'counselor',
      senderName: 'Ms. Johnson',
      senderRole: 'counselor',
      content: newMessage,
      timestamp: 'Just now',
      read: true
    };

    // Update conversation with new message
    selectedConversation.messages.push(message);
    selectedConversation.lastMessage = newMessage;
    selectedConversation.lastMessageTime = 'Just now';

    setNewMessage("");
  };

  const totalUnread = mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  const urgentConversations = mockConversations.filter(conv => conv.status === 'urgent').length;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">Communicate with students and parents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowBulkMessage(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            Bulk Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
                <p className="text-2xl font-bold text-foreground">{mockConversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold text-foreground">{totalUnread}</p>
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
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-foreground">{urgentConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Lightbulb className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Templates Used</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Messages Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Left Panel - Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversations
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search and Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter conversations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Messages</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="parents">Parents Only</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer border-l-4 transition-colors ${
                    selectedConversation?.id === conversation.id 
                      ? 'bg-muted border-l-primary' 
                      : conversation.status === 'urgent' 
                        ? 'border-l-destructive' 
                        : 'border-l-transparent'
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.studentAvatar} alt={conversation.studentName} />
                      <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                        {conversation.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground truncate">
                            {conversation.studentName}
                          </p>
                          {conversation.parentName && (
                            <p className="text-xs text-muted-foreground">
                              & {conversation.parentName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          {conversation.status === 'urgent' && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {conversation.lastMessageTime}
                        </p>
                        <div className="flex gap-1">
                          {conversation.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Conversation View */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.studentAvatar} alt={selectedConversation.studentName} />
                      <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                        {selectedConversation.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedConversation.studentName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.participants.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 flex flex-col h-[550px]">
                {/* Messages Area */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderRole === 'counselor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.senderRole === 'counselor' ? 'order-2' : 'order-1'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {message.senderRole !== 'counselor' && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {message.senderName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRoleColor(message.senderRole)}`}
                          >
                            {message.senderRole}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp}
                          </span>
                        </div>
                        
                        <div 
                          className={`p-3 rounded-lg ${
                            message.senderRole === 'counselor' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <div 
                                  key={index}
                                  className="flex items-center gap-2 p-2 bg-background/10 rounded"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="text-xs">{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          {message.read ? (
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {message.read ? 'Read' : 'Delivered'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message Composer */}
                <div className="border-t border-border p-4 space-y-3">
                  {showAITemplates && (
                    <Card className="bg-muted/30">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            Message Templates
                          </h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowAITemplates(false)}
                          >
                            ×
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {messageTemplates.map((template) => (
                            <Button
                              key={template.id}
                              variant="outline"
                              size="sm"
                              className="text-left h-auto p-2"
                              onClick={() => generateTemplateMessage(template.id)}
                            >
                              <div>
                                <p className="font-medium text-xs">{template.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {template.template.substring(0, 50)}...
                                </p>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[60px] resize-none pr-12"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setShowAITemplates(!showAITemplates)}
                      >
                        <Lightbulb className="h-4 w-4 text-ai-accent" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a conversation from the left to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Bulk Message Dialog */}
      <Dialog open={showBulkMessage} onOpenChange={setShowBulkMessage}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Send Bulk Message
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Recipients</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded p-2">
                {mockConversations.map((conv) => (
                  <div key={conv.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedStudents.includes(conv.studentId)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStudents([...selectedStudents, conv.studentId]);
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== conv.studentId));
                        }
                      }}
                    />
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={conv.studentAvatar} alt={conv.studentName} />
                      <AvatarFallback className="text-xs">
                        {conv.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{conv.studentName}</span>
                    {conv.parentName && (
                      <span className="text-xs text-muted-foreground">& {conv.parentName}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="Type your bulk message here..."
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                disabled={selectedStudents.length === 0 || !bulkMessage.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send to {selectedStudents.length} recipient(s)
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowBulkMessage(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;