import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EssayFeedbackModal } from "@/components/EssayFeedbackModal";
import { CounselorFeedbackHistory } from "@/components/CounselorFeedbackHistory";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAssignedStudents } from "@/hooks/useAssignedStudents";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

import {
  Search,
  Download,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Star,
  LayoutGrid,
  List,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
interface Essay {
  id: string
  title: string
  studentName: string
  studentAvatar: string | null
  studentId: string
  counselorId: string
  prompt: string | null
  wordCount: number
  status: string
  aiScore: number | null
  aiAnalysis: any
  feedbackItems: any
  manualNotes: string | null
  personalMessage: string | null
  content: string
  createdAt: string
  updatedAt: string
  sentAt: string | null
}

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const statusPillClass = (status: string) => {
  switch (status) {
    case 'sent':
      return 'bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline'
    case 'in_progress':
      return 'bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline'
    case 'pending':
      return 'bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline'
    case 'draft':
      return 'bg-white/[0.06] text-foreground/80 hairline'
    default:
      return 'bg-white/[0.03] text-muted-foreground hairline'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'sent': return CheckCircle
    case 'in_progress': return Clock
    case 'pending': return AlertCircle
    case 'draft': return FileText
    default: return FileText
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'sent': return 'Sent'
    case 'in_progress': return 'In Review'
    case 'pending': return 'Needs Attention'
    case 'draft': return 'Draft'
    default: return status
  }
}

interface EssayDialogProps {
  essay: Essay;
  onOpenFeedback: (essay: Essay) => void;
  onUpdateStatus: (essayId: string, status: string) => void;
}

const EssayDialog = ({ essay, onOpenFeedback }: EssayDialogProps) => {
  const StatusIcon = getStatusIcon(essay.status)
  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-pn-card hairline">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 hairline">
              <AvatarFallback className="bg-white/[0.04] text-foreground">
                {essay.studentName.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="font-serif text-2xl text-foreground leading-tight truncate">{essay.title}</h2>
              <p className="text-sm text-muted-foreground">{essay.studentName}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusPillClass(essay.status)}`}>
            <StatusIcon className="h-3 w-3" />
            {getStatusLabel(essay.status)}
          </span>
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/[0.02] hairline p-1 h-auto">
          <TabsTrigger
            value="review"
            className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
          >
            Review
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
          >
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-[color:var(--pn-gold)]" />
                  The essay
                </h3>
                {essay.prompt && (
                  <div className="mb-4 p-3 hairline rounded-lg bg-white/[0.02]">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Prompt</p>
                    <p className="text-sm text-muted-foreground">{essay.prompt}</p>
                  </div>
                )}
                <p className="text-foreground whitespace-pre-wrap font-serif text-base leading-relaxed">
                  {essay.content}
                </p>
              </HairlineCard>
            </div>

            <div className="space-y-4">
              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-[color:var(--pn-sage)]" />
                  Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Word count</span>
                    <span className="num-display text-foreground">{essay.wordCount}</span>
                  </div>
                  {essay.aiScore && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">AI score</span>
                      <span className="num-display text-foreground">{essay.aiScore}/100</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last updated</span>
                    <span className="text-foreground">
                      {new Date(essay.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {essay.sentAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sent</span>
                      <span className="text-foreground">
                        {new Date(essay.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </HairlineCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <HairlineCard>
            <h3 className="font-serif text-xl text-foreground mb-4">Counselor feedback</h3>
            <div className="space-y-4">
              {essay.manualNotes && (
                <div className="p-3 hairline rounded-lg bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Your notes</p>
                  <p className="text-sm text-foreground">{essay.manualNotes}</p>
                </div>
              )}
              {essay.personalMessage && (
                <div className="p-3 hairline rounded-lg bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Personal message to student</p>
                  <p className="text-sm text-foreground">{essay.personalMessage}</p>
                </div>
              )}
              <Button
                size="lg"
                className="w-full bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                onClick={() => onOpenFeedback(essay)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Open feedback editor
              </Button>
            </div>
          </HairlineCard>
          <CounselorFeedbackHistory essayId={essay.id} />
        </TabsContent>

      </Tabs>

      <div className="flex gap-2 pt-4 hairline-t">
        <Button
          className="flex-1 bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
          onClick={() => onOpenFeedback(essay)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Send feedback
        </Button>
      </div>
    </DialogContent>
  )
}

const Essays = () => {
  const queryClient = useQueryClient();
  const [essays, setEssays] = useState<Essay[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("updatedAt")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [feedbackModalEssay, setFeedbackModalEssay] = useState<Essay | null>(null)
  const { toast } = useToast()
  const { data: studentIds = [], isLoading: loadingAssignments } = useAssignedStudents();

  useEffect(() => {
    fetchEssays()
  }, [studentIds])

  const fetchEssays = async () => {
    setLoading(true);

    try {
      if (!studentIds || studentIds.length === 0) {
        setEssays([]);
        return;
      }

      const { data: essayData, error } = await supabase
        .from("essay_feedback")
        .select("*")
        .in("student_id", studentIds)
        .neq("status", "draft")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const { data: profilesData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", studentIds);

      if (profileError) throw profileError;

      const assembled: Essay[] = (essayData || []).map((e) => {
        const profile = profilesData?.find((p) => p.user_id === e.student_id);

        return {
          id: e.id,
          title: e.essay_title,
          studentName: profile?.full_name || "Unknown Student",
          studentAvatar: profile?.avatar_url || null,
          studentId: e.student_id,
          counselorId: e.counselor_id,
          prompt: e.essay_prompt,
          wordCount: e.essay_content?.split(/\s+/).filter(Boolean).length || 0,
          status: e.status,
          aiScore: e.ai_analysis ? (e.ai_analysis as any)?.overall_score || null : null,
          aiAnalysis: e.ai_analysis,
          feedbackItems: e.feedback_items,
          manualNotes: e.manual_notes,
          personalMessage: e.personal_message,
          content: e.essay_content,
          createdAt: e.created_at,
          updatedAt: e.updated_at,
          sentAt: e.sent_at,
        };
      });

      setEssays(assembled);
    } catch (error: any) {
      toast({
        title: "Failed to load essays",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEssayStatus = async (essayId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('essay_feedback')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', essayId)

      if (error) throw error

      setEssays(prev => prev.map(e => e.id === essayId ? { ...e, status: newStatus } : e))
      toast({ title: 'Status updated', description: `Essay marked as ${newStatus}` })
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' })
    }
  }

  const stats = {
    total: essays.length,
    inReview: essays.filter(e => e.status === 'in_progress').length,
    needsAttention: essays.filter(e => e.status === 'pending').length,
    avgScore: essays.length
      ? Math.round(essays.filter(e => e.aiScore).reduce((sum, e) => sum + (e.aiScore || 0), 0) / essays.filter(e => e.aiScore).length) || 0
      : 0
  }

  const filteredEssays = essays.filter(essay => {
    const matchesSearch =
      essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      essay.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || essay.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    if (sortBy === 'aiScore') return (b.aiScore || 0) - (a.aiScore || 0)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  if (loading || loadingAssignments) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  const statTiles: Array<{ label: string; value: number | string; icon: any; tone: string }> = [
    { label: 'Total essays', value: stats.total, icon: FileText, tone: 'var(--pn-sage)' },
    { label: 'In review', value: stats.inReview, icon: Clock, tone: 'var(--pn-gold)' },
    { label: 'Needs attention', value: stats.needsAttention, icon: AlertCircle, tone: 'var(--pn-pink)' },
    { label: 'Avg AI score', value: stats.avgScore || '—', icon: Star, tone: 'var(--pn-sage)' },
  ];

  return (
    <PageShell>
      <BlurOrb tone="sage" className="top-[-100px] left-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Essays"
        title={<>Every draft you're carrying.</>}
        subtitle={<>The desk — sorted by what needs you most.</>}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
              onClick={() => window.location.href = '/essay-analytics'}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        }
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
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by essay or student name…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-white/[0.02] hairline">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-pn-card hairline">
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="in_progress">In review</SelectItem>
                    <SelectItem value="pending">Needs attention</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[120px] bg-white/[0.02] hairline">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="bg-pn-card hairline">
                    <SelectItem value="updatedAt">Latest</SelectItem>
                    <SelectItem value="aiScore">AI score</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex hairline rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none shadow-none ${viewMode === 'grid' ? 'bg-white/[0.06] text-foreground' : 'text-muted-foreground hover:bg-white/[0.03]'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none shadow-none ${viewMode === 'list' ? 'bg-white/[0.06] text-foreground' : 'text-muted-foreground hover:bg-white/[0.03]'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredEssays.map(essay => {
              const StatusIcon = getStatusIcon(essay.status)
              return (
                <Dialog key={essay.id}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer">
                      <HairlineCard className="group hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start justify-between mb-4 gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 hairline">
                              <AvatarFallback className="bg-white/[0.04] text-foreground">
                                {essay.studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h3 className="font-serif text-lg text-foreground truncate">
                                {essay.title}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">{essay.studentName}</p>
                            </div>
                          </div>
                          <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusPillClass(essay.status)}`}>
                            <StatusIcon className="h-3 w-3" />
                            {getStatusLabel(essay.status)}
                          </span>
                        </div>

                        {essay.aiScore && (
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI score</span>
                            <span className="num-display text-foreground">{essay.aiScore}/100</span>
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-serif italic">
                          {essay.content}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 hairline-t">
                          <span><span className="num-display">{essay.wordCount}</span> words</span>
                          <span>Updated {new Date(essay.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </HairlineCard>
                    </div>
                  </DialogTrigger>
                  <EssayDialog essay={essay} onOpenFeedback={setFeedbackModalEssay} onUpdateStatus={updateEssayStatus} />
                </Dialog>
              )
            })}
          </motion.div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <motion.div variants={sectionVariants}>
            <HairlineCard className="p-0 overflow-hidden">
              <div className="divide-y divide-white/[0.04]">
                {filteredEssays.map(essay => {
                  const StatusIcon = getStatusIcon(essay.status)
                  return (
                    <Dialog key={essay.id}>
                      <DialogTrigger asChild>
                        <div className="flex items-center gap-4 p-4 hover:bg-white/[0.02] cursor-pointer transition-colors">
                          <Avatar className="h-10 w-10 hairline">
                            <AvatarFallback className="bg-white/[0.04] text-foreground">
                              {essay.studentName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-lg text-foreground truncate">{essay.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">{essay.studentName}</p>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            {essay.aiScore && (
                              <div className="text-center">
                                <div className="num-display text-[color:var(--pn-sage)]">{essay.aiScore}</div>
                                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Score</div>
                              </div>
                            )}
                            <div className="text-center">
                              <div className="num-display text-foreground">{essay.wordCount}</div>
                              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Words</div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusPillClass(essay.status)}`}>
                              <StatusIcon className="h-3 w-3" />
                              {getStatusLabel(essay.status)}
                            </span>
                            <div className="text-xs text-muted-foreground hidden md:block">
                              {new Date(essay.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </DialogTrigger>
                      <EssayDialog essay={essay} onOpenFeedback={setFeedbackModalEssay} onUpdateStatus={updateEssayStatus} />
                    </Dialog>
                  )
                })}
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {filteredEssays.length === 0 && (
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="sage" className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-serif text-xl text-foreground mb-2">Nothing on your desk — yet.</h3>
              <p className="font-serif italic text-muted-foreground">
                {essays.length === 0
                  ? 'No essays have come in.'
                  : 'Try loosening the filters.'}
              </p>
            </HairlineCard>
          </motion.div>
        )}
      </motion.div>

      {/* Feedback Modal */}
      {feedbackModalEssay && (
        <EssayFeedbackModal
          isOpen={!!feedbackModalEssay}
          onClose={() => {
            setFeedbackModalEssay(null);
            queryClient.invalidateQueries({ queryKey: ["essays"] });
            fetchEssays();
          }}
          essay={{
            id: feedbackModalEssay.id,
            title: feedbackModalEssay.title,
            studentName: feedbackModalEssay.studentName,
            studentId: feedbackModalEssay.studentId,
            prompt: feedbackModalEssay.prompt || '',
            content: feedbackModalEssay.content,
          }}
        />
      )}
    </PageShell>
  )
}

export default Essays
