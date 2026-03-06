import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Send,
  MessageSquare,
  AlertCircle,
  Paperclip,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

type MockMessage = {
  id: string;
  senderId: "student" | "counselor";
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
};

type MockConversation = {
  id: string;
  counselorName: string;
  counselorInitials: string;
  subject: string;
  status: "active" | "urgent";
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: MockMessage[];
};

const mockConversations: MockConversation[] = [
  {
    id: "conv-1",
    counselorName: "Ms. Johnson",
    counselorInitials: "MJ",
    subject: "Essay Feedback",
    status: "active",
    lastMessage: "Please revise the opening paragraph of your Common App essay.",
    lastTime: "2h ago",
    unread: 2,
    messages: [
      {
        id: "m1",
        senderId: "counselor",
        senderName: "Ms. Johnson",
        content: "Hi! I reviewed your Common App essay draft. Great start — your storytelling is compelling.",
        timestamp: "Mar 5, 2026 · 10:14 AM",
        read: true,
      },
      {
        id: "m2",
        senderId: "student",
        senderName: "You",
        content: "Thank you! I worked really hard on it. Is there anything I should change?",
        timestamp: "Mar 5, 2026 · 10:32 AM",
        read: true,
      },
      {
        id: "m3",
        senderId: "counselor",
        senderName: "Ms. Johnson",
        content: "Yes — please revise the opening paragraph. It's a bit generic right now. Start with a specific moment instead of a broad statement.",
        timestamp: "Mar 5, 2026 · 11:00 AM",
        read: true,
      },
      {
        id: "m4",
        senderId: "counselor",
        senderName: "Ms. Johnson",
        content: "Please revise the opening paragraph of your Common App essay.",
        timestamp: "Mar 5, 2026 · 3:45 PM",
        read: false,
      },
    ],
  },
  {
    id: "conv-2",
    counselorName: "Ms. Johnson",
    counselorInitials: "MJ",
    subject: "Stanford Deadline Reminder",
    status: "urgent",
    lastMessage: "Stanford's deadline is in 5 days. Have you submitted your supplemental essays?",
    lastTime: "Yesterday",
    unread: 1,
    messages: [
      {
        id: "m5",
        senderId: "counselor",
        senderName: "Ms. Johnson",
        content: "Stanford's deadline is in 5 days. Have you submitted your supplemental essays?",
        timestamp: "Mar 4, 2026 · 9:00 AM",
        read: false,
      },
    ],
  },
  {
    id: "conv-3",
    counselorName: "Ms. Johnson",
    counselorInitials: "MJ",
    subject: "Recommendation Letter Update",
    status: "active",
    lastMessage: "Both of your recommendation letters have been submitted.",
    lastTime: "Mar 2",
    unread: 0,
    messages: [
      {
        id: "m6",
        senderId: "counselor",
        senderName: "Ms. Johnson",
        content: "Great news! Both of your recommendation letters have been submitted by your teachers.",
        timestamp: "Mar 2, 2026 · 2:15 PM",
        read: true,
      },
      {
        id: "m7",
        senderId: "student",
        senderName: "You",
        content: "That's a relief! Thank you for following up with them.",
        timestamp: "Mar 2, 2026 · 2:40 PM",
        read: true,
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const StudentMessages = () => {
  const [conversations] = useState<MockConversation[]>(mockConversations);
  const [selected, setSelected] = useState<MockConversation>(mockConversations[0]);
  const [threadMessages, setThreadMessages] = useState<Record<string, MockMessage[]>>(
    Object.fromEntries(mockConversations.map((c) => [c.id, c.messages]))
  );
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  const filteredConversations = conversations.filter((c) =>
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = () => {
    if (!newMessage.trim() || !selected) return;

    const msg: MockMessage = {
      id: `m-${Date.now()}`,
      senderId: "student",
      senderName: "You",
      content: newMessage.trim(),
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      read: true,
    };

    setThreadMessages((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), msg],
    }));

    setNewMessage("");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Messages</h1>
          <p className="text-muted-foreground">Stay in touch with your counselor</p>
        </div>
        {totalUnread > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-lg px-4 py-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{totalUnread} unread message{totalUnread > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[680px]">

        {/* Conversation List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`p-4 cursor-pointer border-l-4 transition-colors hover:bg-muted/50 ${
                  selected.id === conv.id
                    ? "bg-muted border-l-primary"
                    : conv.status === "urgent"
                    ? "border-l-destructive"
                    : "border-l-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                      {conv.counselorInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground text-sm truncate">{conv.subject}</p>
                      {conv.unread > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs shrink-0">
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{conv.counselorName}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">{conv.lastTime}</span>
                      {conv.status === "urgent" && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Urgent</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2 flex flex-col">
          {selected ? (
            <>
              {/* Thread Header */}
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold">
                      {selected.counselorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{selected.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      with {selected.counselorName}
                    </p>
                  </div>
                  {selected.status === "urgent" && (
                    <Badge variant="destructive" className="ml-auto">Urgent</Badge>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                {(threadMessages[selected.id] || []).map((msg) => {
                  const isStudent = msg.senderId === "student";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] space-y-1 ${isStudent ? "items-end" : "items-start"} flex flex-col`}>
                        <div className="flex items-center gap-2">
                          {!isStudent && (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {selected.counselorInitials}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="text-xs text-muted-foreground">{msg.senderName}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isStudent
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted text-foreground rounded-tl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                        {isStudent && (
                          <span className="text-[10px] text-muted-foreground">
                            {msg.read ? "Read" : "Delivered"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>

              {/* Composer */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type a message to your counselor..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[60px] max-h-[120px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Shift+Enter</kbd> for new line
                </p>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No conversation selected</h3>
                <p className="text-muted-foreground text-sm">Choose a conversation from the left</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentMessages;
