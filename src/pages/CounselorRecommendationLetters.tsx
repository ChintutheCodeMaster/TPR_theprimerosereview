import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useCelebration } from "@/hooks/useCelebration";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  useCounselorRecommendations,
  useRecLetterMessages,
  useSendCounselorNote,
  type RecommendationWithProfile,
} from "@/hooks/useRecommendationRequests";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  CheckCircle,
  Send,
  User,
  Edit3,
  ChevronLeft,
  AlertCircle,
  Loader2,
  Link,
  Copy,
  MessageSquare,
} from "lucide-react";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const CounselorRecommendationLetters = () => {
  const { toast } = useToast();
  const { celebrate, activeEvent } = useCelebration();
  const { requests = [], isLoading, sendLetter, updateRequest } =
    useCounselorRecommendations();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] =
    useState<RecommendationWithProfile | null>(null);
  const [counselorNotes, setCounselorNotes] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const { data: messages = [] } = useRecLetterMessages(selectedRequest?.id ?? null);
  const sendCounselorNote = useSendCounselorNote();

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const studentName = req.profiles?.full_name || "";
      const matchesSearch =
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.referee_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      inProgress: requests.filter((r) => r.status === "in_progress").length,
      sent: requests.filter((r) => r.status === "sent").length,
    };
  }, [requests]);

  const getStatusPill = (status: string) => {
    const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs";
    switch (status) {
      case "sent":
        return (
          <span className={`${base} bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline`}>
            <CheckCircle className="h-3 w-3" /> Sent
          </span>
        );
      case "in_progress":
        return (
          <span className={`${base} bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline`}>
            <Edit3 className="h-3 w-3" /> In progress
          </span>
        );
      case "pending":
        return (
          <span className={`${base} bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline`}>
            <AlertCircle className="h-3 w-3" /> Pending
          </span>
        );
      default:
        return (
          <span className={`${base} bg-white/[0.03] text-muted-foreground hairline`}>Draft</span>
        );
    }
  };

  const handleSend = async () => {
    if (!selectedRequest) return;

    const letterToSend =
      generatedLetter || selectedRequest.generated_letter;

    if (!letterToSend) {
      toast({
        title: "No Letter",
        description: "Please generate or write a letter first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendLetter.mutateAsync({
        id: selectedRequest.id,
        letter: letterToSend,
      });

      try {
        const { data: { user: counselor } } = await supabase.auth.getUser();
        const { data: counselorProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", counselor?.id)
          .maybeSingle();

        await supabase.functions.invoke("send-rec-letter-notification", {
          body: {
            studentEmail: selectedRequest.profiles?.email ?? "",
            studentName: selectedRequest.profiles?.full_name ?? "Student",
            counselorName: counselorProfile?.full_name ?? "Your counselor",
            refereeName: selectedRequest.referee_name,
            appUrl: window.location.origin,
          },
        });
      } catch (notifyErr) {
        console.error("Failed to send rec letter notification:", notifyErr);
      }

      celebrate('rec_letter_sent');
      setSelectedRequest(null);
      setGeneratedLetter("");
      setCounselorNotes("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send letter",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  /* ─── Detail View ─── */
  if (selectedRequest) {
    const studentName = selectedRequest.profiles?.full_name || "Unknown Student";
    const hasAnswers =
      selectedRequest.meaningful_project ||
      selectedRequest.best_moment ||
      selectedRequest.difficulties_overcome ||
      selectedRequest.personal_notes;

    return (
      <PageShell>
        <BlurOrb tone="pink" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            className="hairline hover:bg-white/[0.03] text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSelectedRequest(null);
              setGeneratedLetter("");
              setCounselorNotes("");
              setNewNoteContent("");
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Recommendation
            </p>
            <h1 className="font-serif text-3xl text-foreground leading-tight">{studentName}</h1>
            <p className="text-muted-foreground text-sm">
              {selectedRequest.referee_name}
              {selectedRequest.referee_role && ` · ${selectedRequest.referee_role}`}
            </p>
          </div>
          <div className="ml-auto">{getStatusPill(selectedRequest.status)}</div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Left */}
          <motion.div variants={sectionVariants} className="space-y-4">
            <HairlineCard>
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-[color:var(--pn-sage)]" />
                The student's answers
              </h3>
              <div className="space-y-3 text-sm">
                {selectedRequest.relationship_duration && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Relationship duration</p>
                    <p className="text-foreground">{selectedRequest.relationship_duration}</p>
                  </div>
                )}
                {selectedRequest.relationship_capacity && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Working relationship</p>
                    <p className="text-foreground">{selectedRequest.relationship_capacity}</p>
                  </div>
                )}
                {selectedRequest.meaningful_project && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Meaningful project</p>
                    <p className="text-foreground">{selectedRequest.meaningful_project}</p>
                  </div>
                )}
                {selectedRequest.best_moment && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Best moment</p>
                    <p className="text-foreground">{selectedRequest.best_moment}</p>
                  </div>
                )}
                {selectedRequest.difficulties_overcome && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Difficulties overcome</p>
                    <p className="text-foreground">{selectedRequest.difficulties_overcome}</p>
                  </div>
                )}
                {selectedRequest.strengths && selectedRequest.strengths.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Key strengths</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRequest.strengths.map((s) => (
                        <span key={s} className="hairline rounded-full px-2 py-0.5 text-xs text-foreground">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRequest.personal_notes && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Personal notes</p>
                    <p className="text-foreground">{selectedRequest.personal_notes}</p>
                  </div>
                )}
                {!hasAnswers && (
                  <p className="font-serif italic text-muted-foreground">
                    The student hasn't answered yet.
                  </p>
                )}
              </div>
            </HairlineCard>

            {/* Teacher Link */}
            <HairlineCard>
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                <Link className="h-4 w-4 text-[color:var(--pn-gold)]" />
                Teacher link
              </h3>
              <div className="space-y-3">
                {selectedRequest.teacher_token ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Share this private link with{" "}
                      <strong className="text-foreground">{selectedRequest.referee_name}</strong>
                      {selectedRequest.teacher_email && (
                        <> ({selectedRequest.teacher_email})</>
                      )}{" "}
                      so they can write the first draft directly.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/teacher-rec/${selectedRequest.teacher_token}`}
                        className="text-xs font-mono bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/teacher-rec/${selectedRequest.teacher_token}`
                          );
                          toast({ title: "Link copied to clipboard" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedRequest.teacher_draft ? (
                      <div className="rounded-md bg-[color:var(--pn-sage)]/10 hairline px-3 py-2 text-sm text-[color:var(--pn-sage)] flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Teacher's draft is loaded in the editor.
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center font-serif italic">
                        Waiting for the teacher's draft…
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No teacher token found for this request.
                  </p>
                )}
              </div>
            </HairlineCard>

            {/* Revision Thread */}
            <HairlineCard>
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4 text-[color:var(--pn-pink)]" />
                Back-and-forth
              </h3>
              <div className="space-y-3">
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {messages.length === 0 ? (
                    <p className="text-sm text-center py-4 font-serif italic text-muted-foreground">
                      No notes yet. Send the teacher a revision below.
                    </p>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.sender_role === 'counselor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm break-words ${
                            m.sender_role === 'counselor'
                              ? 'bg-[color:var(--pn-pink)]/15 hairline text-foreground'
                              : 'bg-white/[0.03] hairline text-foreground'
                          }`}
                        >
                          <p>{m.content}</p>
                          <p className="text-xs mt-1 text-muted-foreground">
                            {m.sender_role === 'counselor' ? 'You' : selectedRequest.referee_name} · {new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {selectedRequest.status !== 'sent' && (
                  <>
                    <Textarea
                      placeholder="Write a revision note for the teacher…"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={3}
                      className="resize-none text-sm bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      className="w-full bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                      size="sm"
                      disabled={!newNoteContent.trim() || sendCounselorNote.isPending}
                      onClick={async () => {
                        const content = newNoteContent.trim();
                        await sendCounselorNote.mutateAsync({ requestId: selectedRequest.id, content });
                        setNewNoteContent("");
                        try {
                          const { data: { user: counselor } } = await supabase.auth.getUser();
                          const { data: counselorProfile } = await supabase
                            .from("profiles").select("full_name").eq("user_id", counselor?.id ?? "").maybeSingle();
                          await supabase.functions.invoke("notify-teacher-revision", {
                            body: {
                              teacherEmail: selectedRequest.teacher_email ?? "",
                              teacherName: selectedRequest.referee_name,
                              studentName: selectedRequest.profiles?.full_name ?? "Student",
                              counselorName: counselorProfile?.full_name ?? "Your counselor",
                              revisionNote: content.slice(0, 200),
                              teacherUrl: `${window.location.origin}/teacher-rec/${selectedRequest.teacher_token}`,
                            },
                          });
                        } catch (e) {
                          console.error("Failed to notify teacher:", e);
                        }
                      }}
                    >
                      {sendCounselorNote.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                      ) : (
                        <Send className="h-3 w-3 mr-2" />
                      )}
                      Send note to teacher
                    </Button>
                  </>
                )}
              </div>
            </HairlineCard>
          </motion.div>

          {/* Right: Letter */}
          <motion.div variants={sectionVariants} className="space-y-4">
            <HairlineCard className="h-full">
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-[color:var(--pn-sage)]" />
                The letter
              </h3>
              <div className="space-y-4">
                <Textarea
                  placeholder="The teacher's draft will appear here. Edit as needed."
                  value={generatedLetter || selectedRequest.generated_letter || selectedRequest.teacher_draft || ""}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  rows={20}
                  className="font-serif text-base resize-none bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0 leading-relaxed"
                />
                <Button
                  onClick={handleSend}
                  disabled={
                    sendLetter.isPending ||
                    (!generatedLetter && !selectedRequest.generated_letter && !selectedRequest.teacher_draft)
                  }
                  className="w-full bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                >
                  {sendLetter.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send letter to student
                </Button>
              </div>
            </HairlineCard>
          </motion.div>
        </motion.div>
      </PageShell>
    );
  }

  /* ─── Main List View ─── */
  const statTiles = [
    { label: "Total", value: stats.total, icon: FileText, tone: "var(--pn-sage)" },
    { label: "Pending", value: stats.pending, icon: AlertCircle, tone: "var(--pn-pink)" },
    { label: "In progress", value: stats.inProgress, icon: Edit3, tone: "var(--pn-gold)" },
    { label: "Sent", value: stats.sent, icon: CheckCircle, tone: "var(--pn-sage)" },
  ];

  return (
    <PageShell>
      <CelebrationOverlay event={activeEvent} />
      <BlurOrb tone="sage" className="top-[-100px] left-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Recommendations"
        title={<>The letters, in your name.</>}
        subtitle={<>Requests, teacher drafts, and the notes between them.</>}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        {/* Stats */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* Filters */}
        <motion.div variants={sectionVariants} className="flex gap-4">
          <Input
            placeholder="Search by student or teacher…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white/[0.02] hairline">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-pn-card hairline">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* List */}
        <motion.div variants={sectionVariants} className="space-y-3">
          {filteredRequests.length === 0 ? (
            <HairlineCard variant="sage" className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="font-serif italic text-muted-foreground">Nothing here yet.</p>
            </HairlineCard>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => {
                  setSelectedRequest(req);
                  setGeneratedLetter(req.generated_letter || "");
                  setCounselorNotes(req.counselor_notes || "");
                }}
                className="cursor-pointer"
              >
                <HairlineCard className="flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <Avatar className="h-10 w-10 hairline">
                    <AvatarImage src={req.profiles?.avatar_url ?? undefined} alt={req.profiles?.full_name ?? ""} />
                    <AvatarFallback className="bg-white/[0.04] text-foreground">
                      {(req.profiles?.full_name || "?").split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-lg text-foreground">{req.profiles?.full_name || "Unknown Student"}</p>
                    <p className="text-sm text-muted-foreground">
                      {req.referee_name}
                      {req.referee_role && ` · ${req.referee_role}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {req.generated_letter && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Draft ready
                      </span>
                    )}
                    {getStatusPill(req.status)}
                  </div>
                </HairlineCard>
              </div>
            ))
          )}
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default CounselorRecommendationLetters;
