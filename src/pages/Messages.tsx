import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Send,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  Users,
  Lightbulb,
  MoreHorizontal,
  Pin,
  Archive,
  Paperclip,
  CheckCheck,
  Check,
  Plus,
} from "lucide-react";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

type DBConversation = {
  id: string;
  student_id: string;
  counselor_id: string;
  parent_id: string | null;
  status: "active" | "urgent" | "archived";
  tags: string[] | null;
  created_at: string;
};

type DBMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const Messages = () => {
  const [conversations, setConversations] = useState<DBConversation[]>([]);
  const [messages, setMessages] = useState<Record<string, DBMessage[]>>({});
  const [selectedConversation, setSelectedConversation] =
    useState<DBConversation | null>(null);

  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState("");
  const [showAITemplates, setShowAITemplates] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [showNewConversation, setShowNewConversation] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [firstMessage, setFirstMessage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const uid = userData.user.id;
      setUserId(uid);

      const { data } = await supabase
        .from("conversations")
        .select("*")
        .or(`student_id.eq.${uid},counselor_id.eq.${uid},parent_id.eq.${uid}`)
        .order("created_at", { ascending: false });

      if (!data) return;

      setConversations(data);

      const userIds = [
        ...new Set(
          data.flatMap((c) => [c.student_id, c.counselor_id, c.parent_id]).filter(Boolean)
        ),
      ];

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds as string[]);

      const profileMap: Record<string, any> = {};
      prof?.forEach((p) => (profileMap[p.user_id] = p));
      setProfiles(profileMap);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .in(
          "conversation_id",
          data.map((c) => c.id)
        )
        .order("created_at");

      const grouped: Record<string, DBMessage[]> = {};
      msgs?.forEach((m) => {
        if (!grouped[m.conversation_id]) grouped[m.conversation_id] = [];
        grouped[m.conversation_id].push(m);
      });

      setMessages(grouped);
    };

    load();
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;

    const convIds = conversations.map((c) => c.id);

    const channel = supabase
      .channel("counselor-messages-rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as DBMessage;
          if (!convIds.includes(msg.conversation_id)) return;
          setMessages((prev) => ({
            ...prev,
            [msg.conversation_id]: [...(prev[msg.conversation_id] || []), msg],
          }));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as DBMessage;
          if (!convIds.includes(msg.conversation_id)) return;
          setMessages((prev) => ({
            ...prev,
            [msg.conversation_id]: (prev[msg.conversation_id] || []).map((m) =>
              m.id === msg.id ? msg : m
            ),
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversation]);

  const selectConversation = async (conv: DBConversation) => {
    setSelectedConversation(conv);

    const unread = (messages[conv.id] || []).filter(
      (m) => !m.read && m.sender_id !== userId
    );
    if (unread.length === 0) return;

    await supabase
      .from("messages")
      .update({ read: true })
      .in("id", unread.map((m) => m.id));

    setMessages((prev) => ({
      ...prev,
      [conv.id]: (prev[conv.id] || []).map((m) =>
        !m.read && m.sender_id !== userId ? { ...m, read: true } : m
      ),
    }));
  };

  const openNewConversationDialog = async () => {
    if (!userId) return;

    const { data: assignments } = await supabase
      .from("student_counselor_assignments")
      .select("student_id")
      .eq("counselor_id", userId);

    if (!assignments || assignments.length === 0) {
      setAssignedStudents([]);
      setShowNewConversation(true);
      return;
    }

    const studentIds = assignments.map((a) => a.student_id);
    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", studentIds);

    setAssignedStudents(profs || []);
    setSelectedStudentId(profs?.[0]?.user_id ?? "");
    setFirstMessage("");
    setShowNewConversation(true);
  };

  const startConversation = async () => {
    if (!selectedStudentId || !firstMessage.trim() || !userId) return;
    setCreating(true);

    const existing = conversations.find(
      (c) => c.student_id === selectedStudentId && c.counselor_id === userId
    );

    if (existing) {
      await supabase
        .from("messages")
        .insert({ conversation_id: existing.id, sender_id: userId, content: firstMessage.trim() })
        .select()
        .single();
      setSelectedConversation(existing);
      setShowNewConversation(false);
      setCreating(false);
      return;
    }

    const { data: conv } = await supabase
      .from("conversations")
      .insert({ student_id: selectedStudentId, counselor_id: userId, status: "active" })
      .select()
      .single();

    if (!conv) { setCreating(false); return; }

    const { data: msg } = await supabase
      .from("messages")
      .insert({ conversation_id: conv.id, sender_id: userId, content: firstMessage.trim() })
      .select()
      .single();

    if (!profiles[selectedStudentId]) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", selectedStudentId)
        .single();
      if (prof) setProfiles((prev) => ({ ...prev, [prof.user_id]: prof }));
    }

    setConversations((prev) => [conv, ...prev]);
    setMessages((prev) => ({ ...prev, [conv.id]: msg ? [msg] : [] }));
    setSelectedConversation(conv);
    setShowNewConversation(false);
    setFirstMessage("");
    setCreating(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedConversation.id,
        sender_id: userData.user.id,
        content: newMessage,
      })
      .select()
      .single();

    if (!data) return;
    setNewMessage("");
  };

  const totalUnread = useMemo(() => {
    return Object.values(messages)
      .flat()
      .filter((m) => !m.read).length;
  }, [messages]);

  const urgentCount = conversations.filter(
    (c) => c.status === "urgent"
  ).length;

  const filteredConversations = conversations.filter((conv) => {
    const studentProfile = profiles[conv.student_id];
    const studentName = studentProfile?.full_name || "";

    const matchesSearch = studentName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const convMessages = messages[conv.id] || [];
    const hasUnread = convMessages.some((m) => !m.read);

    switch (filter) {
      case "urgent":
        return matchesSearch && conv.status === "urgent";
      case "unread":
        return matchesSearch && hasUnread;
      case "students":
        return matchesSearch && !conv.parent_id;
      case "parents":
        return matchesSearch && !!conv.parent_id;
      default:
        return matchesSearch;
    }
  });

  const roleClass = (role: string) => {
    switch (role) {
      case "counselor": return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline";
      case "student":   return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline";
      case "parent":    return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
      default:          return "bg-white/[0.03] text-muted-foreground hairline";
    }
  };

  const statTiles = [
    { label: "Conversations", value: conversations.length, icon: MessageSquare, tone: "var(--pn-sage)" },
    { label: "Unread", value: totalUnread, icon: AlertCircle, tone: "var(--pn-pink)" },
    { label: "Urgent", value: urgentCount, icon: AlertTriangle, tone: "var(--pn-gold)" },
  ];

  return (
    <PageShell>
      <BlurOrb tone="sage" className="top-[-100px] left-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Messages"
        title={<>The threads.</>}
        subtitle={<>Students and parents — in your own hand.</>}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
            onClick={() => setShowBulkMessage(true)}
          >
            <Users className="h-4 w-4 mr-2" />
            Bulk message
          </Button>
        }
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        {/* Stats */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statTiles.map(({ label, value, icon: Icon, tone }) => (
            <HairlineCard key={label}>
              <div className="flex items-center gap-3">
                <div className="hairline rounded-lg p-2" style={{ background: `${tone}20` }}>
                  <Icon className="h-4 w-4" style={{ color: tone }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="num-display text-2xl text-foreground">{value}</p>
                </div>
              </div>
            </HairlineCard>
          ))}
        </motion.div>

        {/* Main Chat Layout */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversations List */}
          <div className="lg:col-span-1 hairline rounded-2xl overflow-hidden flex flex-col bg-pn-card/40">
            <div className="p-4 space-y-3 hairline-b">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[color:var(--pn-sage)]" />
                  Threads
                </h3>
                <Button
                  size="sm"
                  className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                  onClick={openNewConversationDialog}
                  title="New conversation"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="bg-white/[0.02] hairline">
                  <SelectValue placeholder="Filter conversations" />
                </SelectTrigger>
                <SelectContent className="bg-pn-card hairline">
                  <SelectItem value="all">All messages</SelectItem>
                  <SelectItem value="students">Students only</SelectItem>
                  <SelectItem value="parents">Parents only</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <p className="p-8 text-center font-serif italic text-muted-foreground">
                  Nothing here yet.
                </p>
              ) : filteredConversations.map((conv) => {
                const student = profiles[conv.student_id];
                const parent = conv.parent_id ? profiles[conv.parent_id] : null;
                const convMessages = messages[conv.id] || [];
                const lastMsg = convMessages[convMessages.length - 1];
                const unreadCount = convMessages.filter((m) => !m.read && m.sender_id !== userId).length;
                const initials = (student?.full_name || "?")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("");

                const isSelected = selectedConversation?.id === conv.id;
                const accent =
                  isSelected
                    ? "border-l-[color:var(--pn-sage)] bg-white/[0.06]"
                    : conv.status === "urgent"
                    ? "border-l-[color:var(--pn-pink)]"
                    : "border-l-transparent";

                return (
                  <div
                    key={conv.id}
                    className={`p-4 hover:bg-white/[0.02] cursor-pointer border-l-2 border-b border-white/[0.04] transition-colors ${accent}`}
                    onClick={() => selectConversation(conv)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 hairline">
                        <AvatarImage src={student?.avatar_url} alt={student?.full_name} />
                        <AvatarFallback className="bg-white/[0.04] text-foreground">{initials}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="text-foreground truncate">
                              {student?.full_name || "Student"}
                            </p>
                            {parent && (
                              <p className="text-xs text-muted-foreground">
                                & {parent.full_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] num-display bg-[color:var(--pn-pink)]/20 text-[color:var(--pn-pink)] hairline">
                                {unreadCount}
                              </span>
                            )}
                            {conv.status === "urgent" && (
                              <AlertTriangle className="h-4 w-4 text-[color:var(--pn-pink)]" />
                            )}
                          </div>
                        </div>

                        {lastMsg && (
                          <p className="text-sm text-muted-foreground truncate mt-1 font-serif italic">
                            {lastMsg.content}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          {lastMsg && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(lastMsg.created_at).toLocaleString()}
                            </p>
                          )}
                          <div className="flex gap-1">
                            {conv.tags?.map((tag) => (
                              <span key={tag} className="hairline rounded-full px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Messages Panel */}
          <div className="lg:col-span-2 hairline rounded-2xl overflow-hidden flex flex-col bg-pn-card/40">
            {selectedConversation ? (
              <>
                <div className="p-4 hairline-b flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 hairline">
                      <AvatarImage
                        src={profiles[selectedConversation.student_id]?.avatar_url}
                        alt={profiles[selectedConversation.student_id]?.full_name}
                      />
                      <AvatarFallback className="bg-white/[0.04] text-foreground">
                        {(profiles[selectedConversation.student_id]?.full_name || "?")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg text-foreground truncate">
                        {profiles[selectedConversation.student_id]?.full_name || "Conversation"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {[
                          profiles[selectedConversation.student_id]?.full_name,
                          selectedConversation.parent_id &&
                            profiles[selectedConversation.parent_id]?.full_name,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-white/[0.03]">
                      <Pin className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-white/[0.03]">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-white/[0.03]">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {(messages[selectedConversation.id] || []).map((msg) => {
                    const isCounselor = msg.sender_id === selectedConversation.counselor_id;
                    const senderProfile = profiles[msg.sender_id];
                    const senderName = senderProfile?.full_name || "Unknown";
                    const role =
                      msg.sender_id === selectedConversation.counselor_id
                        ? "counselor"
                        : msg.sender_id === selectedConversation.student_id
                        ? "student"
                        : "parent";

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isCounselor ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[80%] ${isCounselor ? "order-2" : "order-1"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {!isCounselor && (
                              <Avatar className="h-6 w-6 hairline">
                                <AvatarFallback className="text-xs bg-white/[0.04] text-foreground">
                                  {senderName.split(" ").map((n: string) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] ${roleClass(role)}`}>
                              {role}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>

                          <div
                            className={`p-3 rounded-lg text-sm ${
                              isCounselor
                                ? "bg-[color:var(--pn-pink)]/15 hairline text-foreground"
                                : "bg-white/[0.04] hairline text-foreground"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>

                          {isCounselor && (
                            <div className="flex items-center gap-1 mt-1 justify-end">
                              {msg.read ? (
                                <CheckCheck className="h-3 w-3 text-[color:var(--pn-sage)]" />
                              ) : (
                                <Check className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {msg.read ? "Read" : "Delivered"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Composer */}
                <div className="hairline-t p-4 space-y-3">
                  {showAITemplates && (
                    <div className="hairline rounded-lg p-3 bg-white/[0.02]">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm text-foreground flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-[color:var(--pn-gold)]" />
                          Templates
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setShowAITemplates(false)}
                        >
                          ×
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {["Deadline Reminder", "Essay Feedback", "Recommendation Status", "Meeting Reminder"].map((title) => (
                          <Button
                            key={title}
                            variant="outline"
                            size="sm"
                            className="text-left h-auto p-2 bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                          >
                            <p className="text-xs">{title}</p>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Type your message…"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[60px] resize-none pr-12 bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-muted-foreground hover:text-[color:var(--pn-gold)] hover:bg-white/[0.03]"
                        onClick={() => setShowAITemplates(!showAITemplates)}
                      >
                        <Lightbulb className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                        className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center px-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="font-serif text-xl text-foreground mb-2">Choose a thread.</h3>
                  <p className="font-serif italic text-muted-foreground">
                    Pick a conversation to begin.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent className="max-w-md bg-pn-card hairline">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-2xl text-foreground">
              <MessageSquare className="h-5 w-5 text-[color:var(--pn-sage)]" />
              New conversation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {assignedStudents.length === 0 ? (
              <p className="font-serif italic text-center py-4 text-muted-foreground">
                No assigned students yet. Assign them first from the Students page.
              </p>
            ) : (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 block">
                    Student
                  </label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger className="bg-white/[0.02] hairline">
                      <SelectValue placeholder="Choose a student…" />
                    </SelectTrigger>
                    <SelectContent className="bg-pn-card hairline">
                      {assignedStudents.map((s) => (
                        <SelectItem key={s.user_id} value={s.user_id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5 hairline">
                              <AvatarImage src={s.avatar_url} />
                              <AvatarFallback className="text-[10px] bg-white/[0.04] text-foreground">
                                {(s.full_name || "S").split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            {s.full_name || s.email || "Student"}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="Your first note…"
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    className="min-h-[100px] bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        startConversation();
                      }
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                    disabled={!selectedStudentId || !firstMessage.trim() || creating}
                    onClick={startConversation}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {creating ? "Starting…" : "Start conversation"}
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                    onClick={() => setShowNewConversation(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Message Dialog */}
      <Dialog open={showBulkMessage} onOpenChange={setShowBulkMessage}>
        <DialogContent className="max-w-2xl bg-pn-card hairline">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-2xl text-foreground">
              <Users className="h-5 w-5 text-[color:var(--pn-gold)]" />
              Send bulk message
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 block">
                Recipients
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto hairline rounded-md p-2 bg-white/[0.02]">
                {conversations.map((conv) => {
                  const student = profiles[conv.student_id];
                  const parent = conv.parent_id ? profiles[conv.parent_id] : null;
                  return (
                    <div key={conv.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedStudents.includes(conv.student_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStudents([...selectedStudents, conv.student_id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter((id) => id !== conv.student_id));
                          }
                        }}
                      />
                      <Avatar className="h-6 w-6 hairline">
                        <AvatarImage src={student?.avatar_url} alt={student?.full_name} />
                        <AvatarFallback className="text-xs bg-white/[0.04] text-foreground">
                          {(student?.full_name || "?").split(" ").map((n: string) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{student?.full_name || "Student"}</span>
                      {parent && (
                        <span className="text-xs text-muted-foreground">& {parent.full_name}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 block">
                Message
              </label>
              <Textarea
                placeholder="Your bulk note…"
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                className="min-h-[120px] bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                disabled={selectedStudents.length === 0 || !bulkMessage.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send to <span className="num-display mx-1">{selectedStudents.length}</span> recipient(s)
              </Button>
              <Button
                variant="outline"
                className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                onClick={() => setShowBulkMessage(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default Messages;
