import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Search, Send, MessageSquare, AlertCircle, Paperclip, CheckCheck, Check, Plus } from "lucide-react";
import { PageShell, PageHeader, BlurOrb } from "@/components/primrose-night";

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

const ParentMessages = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<DBConversation[]>([]);
  const [messages, setMessages] = useState<Record<string, DBMessage[]>>({});
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<DBConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewConvDialog, setShowNewConvDialog] = useState(false);
  const [linkedStudentId, setLinkedStudentId] = useState<string | null>(null);
  const [linkedCounselorId, setLinkedCounselorId] = useState<string | null>(null);
  const [linkedCounselorName, setLinkedCounselorName] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const uid = userData.user.id;
      setUserId(uid);

      const { data: assignment } = await supabase
        .from("parent_student_assignments")
        .select("student_id")
        .eq("parent_id", uid)
        .maybeSingle();

      if (assignment?.student_id) {
        setLinkedStudentId(assignment.student_id);
        const { data: counselorLink } = await supabase
          .from("student_counselor_assignments")
          .select("counselor_id")
          .eq("student_id", assignment.student_id)
          .maybeSingle();

        if (counselorLink?.counselor_id) {
          setLinkedCounselorId(counselorLink.counselor_id);
          const { data: counselorProf } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", counselorLink.counselor_id)
            .single();
          setLinkedCounselorName(counselorProf?.full_name ?? null);
        }
      }

      const { data: convData } = await supabase
        .from("conversations")
        .select("*")
        .eq("parent_id", uid)
        .order("created_at", { ascending: false });

      if (!convData || convData.length === 0) {
        setLoading(false);
        return;
      }

      setConversations(convData);
      setSelected(convData[0]);

      const participantIds = [
        ...new Set([
          ...convData.map((c) => c.counselor_id),
          ...convData.map((c) => c.student_id),
        ].filter(Boolean)),
      ];

      if (participantIds.length > 0) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", participantIds);
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
      .channel("parent-messages-rt")
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

  const handleSend = async () => {
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

    setMessages((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), data],
    }));
    setNewMessage("");
  };

  const createConversation = async () => {
    if (!userId || !linkedStudentId || !linkedCounselorId) return;
    setCreating(true);

    const existing = conversations.find(
      (c) => c.student_id === linkedStudentId && c.counselor_id === linkedCounselorId
    );
    if (existing) {
      setSelected(existing);
      setShowNewConvDialog(false);
      setCreating(false);
      return;
    }

    const { data: newConv } = await supabase
      .from("conversations")
      .insert({
        student_id: linkedStudentId,
        counselor_id: linkedCounselorId,
        parent_id: userId,
        status: "active",
      })
      .select()
      .single();

    if (newConv) {
      setConversations((prev) => [newConv, ...prev]);
      setSelected(newConv);
      setMessages((prev) => ({ ...prev, [newConv.id]: [] }));
    }

    setShowNewConvDialog(false);
    setCreating(false);
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
    const studentName = profiles[c.student_id]?.full_name ?? "";
    const lastMsg = messages[c.id]?.at(-1)?.content ?? "";
    const q = searchTerm.toLowerCase();
    return (
      counselorName.toLowerCase().includes(q) ||
      studentName.toLowerCase().includes(q) ||
      lastMsg.toLowerCase().includes(q)
    );
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

  const getThreadLabel = (conv: DBConversation) => {
    const counselorName = profiles[conv.counselor_id]?.full_name || "Counselor";
    const studentName = profiles[conv.student_id]?.full_name;
    return studentName
      ? `${counselorName} · re: ${studentName}`
      : counselorName;
  };

  return (
    <PageShell>
      <BlurOrb tone="sage" className="top-[-100px] left-[-100px] w-[500px] h-[500px]" />

      {/* New Conversation Dialog */}
      <Dialog open={showNewConvDialog} onOpenChange={setShowNewConvDialog}>
        <DialogContent className="bg-pn-card hairline">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-foreground">
              Reach out to the counselor.
            </DialogTitle>
            <DialogDescription className="font-serif italic text-muted-foreground">
              {linkedCounselorName
                ? `This starts a conversation with ${linkedCounselorName}, your child's assigned counselor.`
                : "No counselor is assigned to your child yet. Please contact the school to get a counselor assigned."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
              onClick={() => setShowNewConvDialog(false)}
            >
              Cancel
            </Button>
            {linkedCounselorId && (
              <Button
                className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                onClick={createConversation}
                disabled={creating}
              >
                {creating ? "Starting…" : "Start conversation"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PageHeader
        eyebrow="Messages"
        title={<>Threads with the counselor.</>}
        subtitle={<>Stay in touch — quietly, at your own pace.</>}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {totalUnread > 0 && (
              <span className="inline-flex items-center gap-2 hairline rounded-full px-3 py-1 bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]">
                <AlertCircle className="h-3.5 w-3.5" />
                <span className="text-sm">
                  <span className="num-display">{totalUnread}</span> unread
                </span>
              </span>
            )}
            {linkedCounselorId && (
              <Button
                onClick={() => setShowNewConvDialog(true)}
                className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none gap-2"
              >
                <Plus className="h-4 w-4" />
                Message counselor
              </Button>
            )}
          </div>
        }
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        <motion.div variants={sectionVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[680px] hairline rounded-2xl overflow-hidden bg-pn-card/40">
            {/* Conversation List */}
            <div className="lg:col-span-1 flex flex-col hairline-r">
              <div className="p-4 hairline-b">
                <h2 className="font-serif text-xl text-foreground flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-[color:var(--pn-sage)]" />
                  Threads
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center font-serif italic text-muted-foreground text-sm">Loading…</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="font-serif text-foreground">No threads yet.</p>
                    <p className="text-sm font-serif italic text-muted-foreground mt-1 mb-4">
                      {linkedCounselorId
                        ? "Start a conversation with your child's counselor."
                        : "Your child's counselor will start a conversation with you here."}
                    </p>
                    {linkedCounselorId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowNewConvDialog(true)}
                        className="gap-1.5 bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Message counselor
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const counselor = profiles[conv.counselor_id];
                    const student = profiles[conv.student_id];
                    const convMessages = messages[conv.id] || [];
                    const lastMsg = convMessages.at(-1);
                    const unreadCount = convMessages.filter(
                      (m) => !m.read && m.sender_id !== userId
                    ).length;
                    const initials = (counselor?.full_name || "C")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("");

                    const isSelected = selected?.id === conv.id;
                    const accent =
                      isSelected
                        ? "border-l-[color:var(--pn-sage)] bg-white/[0.06]"
                        : conv.status === "urgent"
                        ? "border-l-[color:var(--pn-pink)]"
                        : "border-l-transparent";

                    return (
                      <div
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className={`p-4 cursor-pointer border-l-2 border-b border-white/[0.04] transition-colors hover:bg-white/[0.02] ${accent}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 shrink-0 hairline">
                            <AvatarImage src={counselor?.avatar_url} />
                            <AvatarFallback className="bg-white/[0.04] text-foreground">
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-foreground text-sm truncate">
                                {counselor?.full_name || "Counselor"}
                              </p>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {lastMsg ? formatTime(lastMsg.created_at) : ""}
                              </span>
                            </div>
                            {student && (
                              <p className="text-xs text-[color:var(--pn-sage)] truncate">re: {student.full_name}</p>
                            )}
                            <div className="flex items-center justify-between mt-1 gap-2">
                              <p className="text-xs text-muted-foreground truncate flex-1 font-serif italic">
                                {lastMsg?.content || "No messages yet"}
                              </p>
                              {unreadCount > 0 && (
                                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] num-display bg-[color:var(--pn-pink)]/20 text-[color:var(--pn-pink)] hairline shrink-0">
                                  {unreadCount}
                                </span>
                              )}
                            </div>
                            {conv.status === "urgent" && (
                              <span className="inline-flex items-center px-1.5 py-0 rounded-full text-[10px] uppercase tracking-[0.14em] mt-1 bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline">
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
                  <div className="flex items-center gap-3 p-4 hairline-b">
                    <Avatar className="h-10 w-10 hairline">
                      <AvatarImage src={profiles[selected.counselor_id]?.avatar_url} />
                      <AvatarFallback className="bg-white/[0.04] text-foreground">
                        {(profiles[selected.counselor_id]?.full_name || "C")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-serif text-lg text-foreground">
                        {getThreadLabel(selected)}
                      </h3>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {selected.status === "urgent" ? (
                          <span className="text-[color:var(--pn-pink)]">Urgent</span>
                        ) : (
                          <span className="text-[color:var(--pn-sage)]">Active</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {(messages[selected.id] || []).map((msg) => {
                      const isMe = msg.sender_id === userId;
                      const senderProfile = profiles[msg.sender_id];
                      const senderName = senderProfile?.full_name || "Counselor";
                      const senderInitials = senderName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("");

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
                                  <AvatarImage src={senderProfile?.avatar_url} />
                                  <AvatarFallback className="text-[9px] bg-white/[0.04] text-foreground">
                                    {senderInitials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{senderName}</span>
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
                              <span className="text-[10px] text-muted-foreground">
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

                  <div className="hairline-t p-4">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Textarea
                          placeholder="Type a message…"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="min-h-[52px] max-h-[120px] resize-none bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
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
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSend}
                          disabled={!newMessage.trim()}
                          className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <kbd className="px-1 py-0.5 hairline rounded text-[10px] bg-white/[0.02]">Enter</kbd> to send ·{" "}
                      <kbd className="px-1 py-0.5 hairline rounded text-[10px] bg-white/[0.02]">Shift+Enter</kbd> for new line
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center px-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <h3 className="font-serif text-xl text-foreground mb-2">Choose a thread.</h3>
                    <p className="font-serif italic text-muted-foreground text-sm">
                      Pick a conversation on the left to begin.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default ParentMessages;
