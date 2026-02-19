import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudentPersonalArea, type EssayFeedback } from "@/hooks/Usestudentpersonalarea";
import {
  FileText,
  Upload,
  MessageSquare,
  CheckCircle,
  Clock,
  Calendar,
  Star,
  History,
  AlertCircle,
  TrendingUp,
  MessageCircle,
  Loader2,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":    return "bg-green-500 text-white";
    case "sent":        return "bg-green-500 text-white";
    case "review":      return "bg-yellow-500 text-white";
    case "in_progress": return "bg-yellow-500 text-white";
    case "draft":       return "bg-blue-500 text-white";
    case "completed":   return "bg-green-500 text-white";
    case "in-progress": return "bg-yellow-500 text-white";
    case "not-started": return "bg-gray-500 text-white";
    default:            return "bg-gray-500 text-white";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
    case "sent":
    case "completed":   return <CheckCircle className="h-4 w-4" />;
    case "review":
    case "in_progress":
    case "in-progress": return <Clock className="h-4 w-4" />;
    case "draft":       return <FileText className="h-4 w-4" />;
    default:            return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusLabel = (status: string) =>
  status.replace(/-/g, " ").replace(/_/g, " ");

// ── Component ─────────────────────────────────────────────────

const StudentPersonalArea = () => {
  const {
    essays,
    sentFeedback,
    tasks,
    isLoadingEssays,
    isLoadingFeedback,
    isLoadingTasks,
    completeTask,
    getFeedbackForEssay,
  } = useStudentPersonalArea();

  const [activeTab, setActiveTab]           = useState("essays");
  const [selectedEssay, setSelectedEssay]   = useState<EssayFeedback | null>(null);

  const essayFeedback = selectedEssay
    ? getFeedbackForEssay(selectedEssay.essay_title)
    : [];

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Work</h1>
        <p className="text-muted-foreground">
          Manage your essays, tasks, and track your progress
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="essays">Essays</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* ── Essays Tab ── */}
        <TabsContent value="essays" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Essays</h2>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload New Essay
            </Button>
          </div>

          {isLoadingEssays ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : essays.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No essays yet. Upload your first essay to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {essays.map((essay) => (
                <Card
                  key={essay.id}
                  className="border-l-4 border-l-muted cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setSelectedEssay(essay)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{essay.essay_title}</CardTitle>
                        {essay.essay_prompt && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {essay.essay_prompt}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(essay.status)}>
                        {getStatusIcon(essay.status)}
                        <span className="ml-1 capitalize">{getStatusLabel(essay.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Word Count</p>
                        <p className="font-medium">{essay.essay_content.split(/\s+/).filter(Boolean).length} words</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-medium">
                          {new Date(essay.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Feedback</p>
                        <p className="font-medium">
                          {essay.status === "sent" || essay.status === "read"
                            ? "Available"
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Feedback Tab ── */}
        <TabsContent value="feedback" className="space-y-6">
          <h2 className="text-xl font-semibold">Feedback & Comments</h2>

          {isLoadingFeedback ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sentFeedback.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feedback yet. Your counselor will review your essays soon.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sentFeedback.map((fb) => (
                <Card key={fb.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Essay Feedback</CardTitle>
                      <Badge variant="outline">{fb.essay_title}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Received{" "}
                      {fb.sent_at
                        ? new Date(fb.sent_at).toLocaleDateString()
                        : new Date(fb.created_at).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Personal message */}
                    {fb.personal_message && (
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <p className="text-xs font-medium text-primary mb-1">Personal Note:</p>
                        <p className="text-sm">{fb.personal_message}</p>
                      </div>
                    )}

                    {/* Score */}
                    {fb.ai_analysis?.overallScore && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        <span className="font-semibold">
                          Overall Score: {fb.ai_analysis.overallScore}/100
                        </span>
                      </div>
                    )}

                    {/* Strengths / Improvements */}
                    {(fb.ai_analysis?.strengths || fb.ai_analysis?.improvements) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fb.ai_analysis.strengths && (
                          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                            <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">
                              Strengths
                            </h4>
                            <ul className="text-sm space-y-1">
                              {fb.ai_analysis.strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {fb.ai_analysis.improvements && (
                          <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                            <h4 className="font-medium text-sm mb-2 text-orange-700 dark:text-orange-400">
                              Areas to Improve
                            </h4>
                            <ul className="text-sm space-y-1">
                              {fb.ai_analysis.improvements.map((s, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <TrendingUp className="h-3 w-3 text-orange-600 mt-0.5 shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Tasks Tab ── */}
        <TabsContent value="tasks" className="space-y-6">
          <h2 className="text-xl font-semibold">My Tasks</h2>

          {isLoadingTasks ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks assigned yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(task.completed ? "completed" : "in-progress")}>
                            {getStatusIcon(task.completed ? "completed" : "in-progress")}
                            <span className="ml-1">{task.completed ? "Completed" : "In Progress"}</span>
                          </Badge>
                        </div>
                        <h3 className="font-medium text-lg">{task.task}</h3>
                        {task.due_date && (
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      {!task.completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={completeTask.isPending}
                          onClick={() => completeTask.mutate(task.id)}
                        >
                          {completeTask.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Mark as Done"
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Messages Tab ── */}
        <TabsContent value="messages" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Messages with Counselor</h2>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Send a message to your counselor for help with essays, applications, or any
                  questions.
                </p>
                <Button>Send Your First Message</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Essay Detail Modal ── */}
      <Dialog open={!!selectedEssay} onOpenChange={() => setSelectedEssay(null)}>
        <DialogContent className="max-w-[900px] h-[85vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">{selectedEssay?.essay_title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(selectedEssay?.created_at ?? "").toLocaleDateString()}
                </p>
              </div>
              <Badge className={getStatusColor(selectedEssay?.status ?? "")}>
                {getStatusIcon(selectedEssay?.status ?? "")}
                <span className="ml-1 capitalize">
                  {getStatusLabel(selectedEssay?.status ?? "")}
                </span>
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Essay content */}
            <div className="flex-1 border-r flex flex-col">
              {selectedEssay?.essay_prompt && (
                <div className="p-4 border-b bg-muted/30">
                  <p className="text-sm text-muted-foreground font-medium">Prompt:</p>
                  <p className="text-sm mt-1">{selectedEssay.essay_prompt}</p>
                </div>
              )}
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {selectedEssay?.essay_content ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedEssay.essay_content}
                    </p>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No content yet.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Feedback panel */}
            <div className="w-[350px] flex flex-col">
              <div className="p-4 border-b bg-primary/5">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Counselor Feedback
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {essayFeedback.length > 0 ? (
                    <div className="space-y-4">
                      {essayFeedback.map((fb) => (
                        <Card key={fb.id} className="bg-card">
                          <CardContent className="p-4 space-y-3">
                            {fb.ai_analysis?.overallScore && (
                              <div className="flex items-center gap-2 pb-3 border-b">
                                <Star className="h-5 w-5 text-primary" />
                                <span className="font-bold text-lg">
                                  {fb.ai_analysis.overallScore}/100
                                </span>
                              </div>
                            )}

                            {fb.personal_message && (
                              <div className="bg-primary/10 p-3 rounded-lg">
                                <p className="text-xs font-medium text-primary mb-1">
                                  Personal Note:
                                </p>
                                <p className="text-sm">{fb.personal_message}</p>
                              </div>
                            )}

                            {fb.feedback_items.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Feedback Points:
                                </p>
                                {fb.feedback_items.map((item, idx) => (
                                  <div
                                    key={item.id ?? idx}
                                    className={`p-2 rounded text-sm ${
                                      item.type === "strength"
                                        ? "bg-green-50 dark:bg-green-950/30 border-l-2 border-green-500"
                                        : "bg-orange-50 dark:bg-orange-950/30 border-l-2 border-orange-500"
                                    }`}
                                  >
                                    {item.category && (
                                      <span
                                        className={`text-[10px] font-medium block ${
                                          item.type === "strength"
                                            ? "text-green-600"
                                            : "text-orange-600"
                                        }`}
                                      >
                                        {item.type === "strength" ? "✓" : "→"} {item.category}
                                      </span>
                                    )}
                                    <p className="text-xs mt-0.5">{item.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {fb.ai_analysis?.criteria && (
                              <div className="pt-2 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                  Score Breakdown:
                                </p>
                                <div className="space-y-1.5">
                                  {Array.isArray(fb.ai_analysis.criteria)
                                    ? fb.ai_analysis.criteria.map((c) => (
                                        <div key={c.id} className="flex items-center gap-2">
                                          <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: c.color }}
                                          />
                                          <span className="text-xs flex-1 truncate">{c.name}</span>
                                          <span className="text-xs font-medium">{c.score}</span>
                                        </div>
                                      ))
                                    : Object.entries(fb.ai_analysis.criteria).map(([key, val]) => (
                                        <div key={key} className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-primary" />
                                          <span className="text-xs flex-1 truncate capitalize">
                                            {key}
                                          </span>
                                          <span className="text-xs font-medium">{val}</span>
                                        </div>
                                      ))}
                                </div>
                              </div>
                            )}

                            {fb.ai_analysis?.strengths && (
                              <div className="pt-2 border-t">
                                <p className="text-xs font-medium text-green-600 mb-1">
                                  ✓ Strengths:
                                </p>
                                <ul className="text-xs space-y-1 text-muted-foreground">
                                  {fb.ai_analysis.strengths.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {fb.ai_analysis?.improvements && (
                              <div className="pt-2">
                                <p className="text-xs font-medium text-orange-600 mb-1">
                                  → To Improve:
                                </p>
                                <ul className="text-xs space-y-1 text-muted-foreground">
                                  {fb.ai_analysis.improvements.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <p className="text-[10px] text-muted-foreground pt-2">
                              Received:{" "}
                              {fb.sent_at
                                ? new Date(fb.sent_at).toLocaleDateString()
                                : "Recently"}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No feedback yet</p>
                      <p className="text-xs mt-1">
                        Your counselor will review your essay soon
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="p-4 border-t flex gap-2">
            <Button className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Edit Essay
            </Button>
            <Button variant="outline" className="flex-1">
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentPersonalArea;