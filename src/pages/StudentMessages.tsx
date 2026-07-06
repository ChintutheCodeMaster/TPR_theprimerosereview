import { useEffect, useRef, useState } from "react";
import { usePreviewMode } from "@/contexts/PreviewModeContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
import {
  PageShell,
  PageHeader,
  BlurOrb,
} from "@/components/primrose-night";
import { Search, Send, MessageSquare, AlertCircle, Paperclip, CheckCheck, Check, Plus } from "lucide-react";

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

const StudentMessages = () => {
  const isPreviewMode = usePreviewMode();
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<DBConversation[]>([]);
  const [messages, setMessages] = useState<Record<string, DBMessage[]>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<DBConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [showNewConversation, setShowNewConversation] = useState(false);
  const [assignedCounselors, setAssignedCounselors] = useState<any[]>([]);
  const [selectedCounselorId, setSelectedCounselorId] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const uid = userData.user.id;
      setUserId(uid);

      const { data: convData } = await supabase
        .from("conversations")
        .select("*")
        .eq("student_id", uid)
        .order("created_at", { ascending: false });

      if (!convData || convData.length === 0) {
        setLoading(false);
        return;
      }

      setConversations(convData);
      setSelected(convData[0]);

      const counselorIds = [...new Set(convData.map((c) => c.counselor_id).filter(Boolean))];
      if (counselorIds.length > 0) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", counselorIds);
        const map: Record<string, any> = {};
        prof?.forEach((p) => (map[p.user_id] = p));
        setProfiles(map);
      }

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .in("conversation_id", convData.map((c) => c.id))
        .order("created_at");

      const grouped: Record<string, DBMessage[]> = {};
      msgs?.forEach((m) => {
        if (!grouped[m.conversation_id]) grouped[m.conversation_id] = [];
        grouped[m.conversation_id].push(m);
      });
      setMessages(grouped);
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;

    const convIds = conversations.map((c) => c.id);

    const channel = supabase
      .channel("student-messages-rt")
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
  }, [messages, selected]);

  const selectConversation = async (conv: DBConversation) => {
    setSelected(conv);

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
      .select("counselor_id")
      .eq("student_id", userId);

    if (!assignments || assignments.length === 0) {
      setAssignedCounselors([]);
      setShowNewConversation(true);
      return;
    }

    const counselorIds = assignments.map((a) => a.counselor_id);
    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", counselorIds);

    setAssignedCounselors(profs || []);
    setSelectedCounselorId(profs?.[0]?.user_id ?? "");
    setFirstMessage("");
    setShowNewConversation(true);
  };

  const startConversation = async () => {
    if (isPreviewMode) {
      toast.info("Preview mode — starting conversations is disabled");
      return;
    }
    if (!selectedCounselorId || !firstMessage.trim() || !userId) return;
    setCreating(true);

    const existing = conversations.find(
      (c) => c.counselor_id === selectedCounselorId && c.student_id === userId
    );

    if (existing) {
      const { data: msg } = await supabase
        .from("messages")
        .insert({ conversation_id: existing.id, sender_id: userId, content: firstMessage.trim() })
        .select()
        .single();
      if (msg) {
        setMessages((prev) => ({
          ...prev,
          [existing.id]: [...(prev[existing.id] || []), msg],
        }));
      }
      setSelected(existing);
      setShowNewConversation(false);
      setCreating(false);
      return;
    }

    const { data: conv } = await supabase
      .from("conversations")
      .insert({ student_id: userId, counselor_id: selectedCounselorId, status: "active" })
      .select()
      .single();

    if (!conv) { setCreating(false); return; }

    const { data: msg } = await supabase
      .from("messages")
      .insert({ conversation_id: conv.id, sender_id: userId, content: firstMessage.trim() })
      .select()
      .single();

    if (!profiles[selectedCounselorId]) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", selectedCounselorId)
        .single();
      if (prof) setProfiles((prev) => ({ ...prev, [prof.user_id]: prof }));
    }

    setConversations((prev) => [conv, ...prev]);
    setMessages((prev) => ({ ...prev, [conv.id]: msg ? [msg] : [] }));
    setSelected(conv);
    setShowNewConversation(false);
    setFirstMessage("");
    setCreating(false);
  };

  const handleSend = async () => {
    if (isPreviewMode) {
      toast.info("Preview mode — sending messages is disabled");
      return;
    }
    if (!newMessage.trim() || !selected || !userId) return;

    const { data } = await supabase
      .from("messages")
      .insert({
        conversation_id: selected.id,
        sender_id: userId,
        content: newMessage.trim(),
      })
      .select()
      .single();

    if (!data) return;
    setNewMessage("");
  };

  const totalUnread = Object.values(messages)
    .flat()
    .filter((m) => !m.read && m.sender_id !== userId).length;

  const sortedConversations = [...conversations].sort((a, b) => {
    const aLast = messages[a.id]?.at(-1)?.created_at ?? a.created_at;
    const bLast = messages[b.id]?.at(-1)?.created_at ?? b.created_at;
    return new Date(bLast).getTime() - new Date(aLast).getTime();
  });

  const filteredConversations = sortedConversations.filter((c) => {
    const counselorName = profiles[c.counselor_id]?.full_name ?? "";
    const lastMsg = messages[c.id]?.at(-1)?.content ?? "";
    const q = searchTerm.toLowerCase();
    return counselorName.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q);
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatFullTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <PageShell maxWidth="wide">
      <BlurOrb tone="sage" className="top-[-100px] left-[-100px] w-[480px] h-[480px]" />

      <PageHeader
        eyebrow="Threads"
        title={<>Every conversation.</>}
        subtitle={<>Where you and your counselor stay in sync.</>}
        actions={
          totalUnread > 0 ? (
            <div className="flex items-center gap-2 hairline bg-[color:var(--pn-pink)]/12 text-[color:var(--pn-pink)] rounded-full px-3 py-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-[0.18em]">
                <span className="num-display">{totalUnread}</span> unread
              </span>
            </div>
          ) : undefined
        }
      />

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[680px] rounded-2xl hairline overflow-hidden bg-white/[0.015]">

        {/* Conversation List */}
        <div className="lg:col-span-1 flex flex-col hairline-r">
          <div className="p-4 hairline-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg text-foreground leading-tight flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Conversations
              </h2>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={openNewConversationDialog}
                title="New conversation"
                className="hairline hover:bg-white/[0.04] text-foreground"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/[0.02] hairline"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm font-serif italic">Loading…</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm font-serif italic text-muted-foreground">No threads yet.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const counselor = profiles[conv.counselor_id];
                const convMessages = messages[conv.id] || [];
                const lastMsg = convMessages.at(-1);
                const unreadCount = convMessages.filter(
                  (m) => !m.read && m.sender_id !== userId
                ).length;
                const initials = (counselor?.full_name || "C")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("");

                const accentBorder =
                  selected?.id === conv.id
                    ? "border-l-[color:var(--pn-sage)]"
                    : conv.status === "urgent"
                    ? "border-l-[color:var(--pn-pink)]"
                    : "border-l-transparent";

                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`p-4 cursor-pointer border-l-2 transition-colors hover:bg-white/[0.02] ${
                      selected?.id === conv.id ? "bg-white/[0.04]" : ""
                    } ${accentBorder}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0 hairline">
                        <AvatarImage src={counselor?.avatar_url} />
                        <AvatarFallback className="bg-white/[0.05] text-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-foreground truncate">
                            {counselor?.full_name || "Your Counselor"}
                          </p>
                          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground shrink-0">
                            {lastMsg ? formatTime(lastMsg.created_at) : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 gap-2">
                          <p className="text-xs text-muted-foreground truncate flex-1">
                            {lastMsg?.content || "No messages yet"}
                          </p>
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] hairline bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] shrink-0">
                              <span className="num-display">{unreadCount}</span>
                            </span>
                          )}
                        </div>
                        {conv.status === "urgent" && (
                          <span className="inline-flex items-center px-1.5 py-0 mt-1 rounded-full text-[10px] uppercase tracking-[0.14em] hairline bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2 flex flex-col">
          {selected ? (
            <>
              {/* Thread Header */}
              <div className="flex items-center gap-3 p-4 hairline-b">
                <Avatar className="h-10 w-10 hairline">
                  <AvatarImage src={profiles[selected.counselor_id]?.avatar_url} />
                  <AvatarFallback className="bg-white/[0.05] text-foreground">
                    {(profiles[selected.counselor_id]?.full_name || "C")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-serif text-lg text-foreground leading-tight">
                    {profiles[selected.counselor_id]?.full_name || "Your Counselor"}
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.18em] mt-0.5 flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background:
                          selected.status === "urgent"
                            ? "var(--pn-pink)"
                            : "var(--pn-sage)",
                      }}
                    />
                    <span className={selected.status === "urgent" ? "text-[color:var(--pn-pink)]" : "text-[color:var(--pn-sage)]"}>
                      {selected.status === "urgent" ? "Urgent" : "Active"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-white/[0.01]">
                {(messages[selected.id] || []).map((msg) => {
                  const isMe = msg.sender_id === userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[72%] flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <Avatar className="h-5 w-5 hairline">
                              <AvatarImage src={profiles[msg.sender_id]?.avatar_url} />
                              <AvatarFallback className="text-[9px] bg-white/[0.05] text-foreground">
                                {(profiles[msg.sender_id]?.full_name || "C")
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              {profiles[msg.sender_id]?.full_name || "Counselor"}
                            </span>
                          </div>
                        )}
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed hairline ${
                            isMe
                              ? "bg-[color:var(--pn-pink)]/15 text-foreground rounded-tr-sm"
                              : "bg-white/[0.04] text-foreground rounded-tl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {formatFullTime(msg.created_at)}
                          </span>
                          {isMe && (
                            msg.read
                              ? <CheckCheck className="h-3 w-3 text-[color:var(--pn-sage)]" />
                              : <Check className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Composer */}
              <div className="hairline-t p-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a note…"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[52px] max-h-[120px] resize-none bg-white/[0.02] hairline font-serif text-base"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hairline hover:bg-white/[0.03]"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSend}
                      disabled={!newMessage.trim()}
                      className="bg-[color:var(--pn-pink)]/15 hairline text-[color:var(--pn-pink)] hover:bg-[color:var(--pn-pink)]/25 shadow-none disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">
                  <kbd className="px-1.5 py-0.5 hairline bg-white/[0.03] rounded text-[10px]">Enter</kbd> to send ·{" "}
                  <kbd className="px-1.5 py-0.5 hairline bg-white/[0.03] rounded text-[10px]">Shift+Enter</kbd> new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="font-serif text-xl text-foreground leading-tight mb-1">Pick a thread.</h3>
                <p className="font-serif italic text-muted-foreground text-sm">Choose a conversation from the left.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent className="max-w-md bg-pn-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-xl text-foreground leading-tight">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              Message your counselor.
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {assignedCounselors.length === 0 ? (
              <p className="text-sm font-serif italic text-muted-foreground text-center py-4">
                No assigned counselor found. Please contact your school to get assigned.
              </p>
            ) : (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 block">Counselor</label>
                  <Select value={selectedCounselorId} onValueChange={setSelectedCounselorId}>
                    <SelectTrigger className="bg-white/[0.02] hairline">
                      <SelectValue placeholder="Choose a counselor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedCounselors.map((c) => (
                        <SelectItem key={c.user_id} value={c.user_id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5 hairline">
                              <AvatarImage src={c.avatar_url} />
                              <AvatarFallback className="text-[10px] bg-white/[0.05] text-foreground">
                                {(c.full_name || "C").split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            {c.full_name || c.email || "Counselor"}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 block">Message</label>
                  <Textarea
                    placeholder="Type your message..."
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    className="min-h-[100px] bg-white/[0.02] hairline font-serif text-base"
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
                    type="button"
                    className="flex-1 bg-[color:var(--pn-pink)]/15 hairline text-[color:var(--pn-pink)] hover:bg-[color:var(--pn-pink)]/25 shadow-none"
                    disabled={!selectedCounselorId || !firstMessage.trim() || creating}
                    onClick={startConversation}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {creating ? "Sending..." : "Send Message"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowNewConversation(false)}
                    className="hairline hover:bg-white/[0.04] text-muted-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default StudentMessages;
