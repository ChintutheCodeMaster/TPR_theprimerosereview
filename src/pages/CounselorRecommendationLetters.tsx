import { useState, useMemo } from "react";
import { useCelebration } from "@/hooks/useCelebration";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useCounselorRecommendations, type RecommendationWithProfile } from "@/hooks/useRecommendationRequests";
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
  Search,
  Sparkles,
  Edit3,
  ChevronLeft,
  Calendar,
  AlertCircle,
  Loader2,
  Link,
  Copy,
} from "lucide-react";

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
  const [isGenerating, setIsGenerating] = useState(false);

  /* ───────────────────────────── */
  /* Derived Values                */
  /* ───────────────────────────── */

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" /> Sent
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Edit3 className="h-3 w-3 mr-1" /> In Progress
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <AlertCircle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  /* ───────────────────────────── */
  /* Actions                       */
  /* ───────────────────────────── */

  const handleGenerateAI = async () => {
    if (!selectedRequest) return;

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "enhance-recommendation",
        {
          body: {
            studentName: selectedRequest.profiles?.full_name ?? "Student",
            refereeName: selectedRequest.referee_name,
            refereeRole: selectedRequest.referee_role ?? "",
            counselorNotes,
            studentAnswers: {
              relationshipDuration: selectedRequest.relationship_duration,
              relationshipCapacity: selectedRequest.relationship_capacity,
              meaningfulProject: selectedRequest.meaningful_project,
              bestMoment: selectedRequest.best_moment,
              difficultiesOvercome: selectedRequest.difficulties_overcome,
              strengths: selectedRequest.strengths,
              personalNotes: selectedRequest.personal_notes,
            },
          },
        }
      );

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setGeneratedLetter(data.letter);

      await updateRequest.mutateAsync({
        id: selectedRequest.id,
        status: "in_progress",
        counselor_notes: counselorNotes,
        generated_letter: data.letter,
      });

      toast({
        title: "Letter Generated",
        description: "AI draft created successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate letter",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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

      // Notify student by email (fire-and-forget — don't block on failure)
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

  /* ───────────────────────────── */
  /* Loading                       */
  /* ───────────────────────────── */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ───────────────────────────── */
  /* Detail View                   */
  /* ───────────────────────────── */

  if (selectedRequest) {
    const studentName = selectedRequest.profiles?.full_name || "Unknown Student";
    const hasAnswers =
      selectedRequest.meaningful_project ||
      selectedRequest.best_moment ||
      selectedRequest.difficulties_overcome ||
      selectedRequest.personal_notes;

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedRequest(null);
              setGeneratedLetter("");
              setCounselorNotes("");
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{studentName}</h1>
            <p className="text-muted-foreground text-sm">
              {selectedRequest.referee_name}
              {selectedRequest.referee_role && ` · ${selectedRequest.referee_role}`}
            </p>
          </div>
          <div className="ml-auto">{getStatusBadge(selectedRequest.status)}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Student Answers */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Student's Questionnaire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {selectedRequest.relationship_duration && (
                  <div>
                    <p className="font-medium text-muted-foreground">Relationship Duration</p>
                    <p>{selectedRequest.relationship_duration}</p>
                  </div>
                )}
                {selectedRequest.relationship_capacity && (
                  <div>
                    <p className="font-medium text-muted-foreground">Working Relationship</p>
                    <p>{selectedRequest.relationship_capacity}</p>
                  </div>
                )}
                {selectedRequest.meaningful_project && (
                  <div>
                    <p className="font-medium text-muted-foreground">Meaningful Project</p>
                    <p>{selectedRequest.meaningful_project}</p>
                  </div>
                )}
                {selectedRequest.best_moment && (
                  <div>
                    <p className="font-medium text-muted-foreground">Best Moment</p>
                    <p>{selectedRequest.best_moment}</p>
                  </div>
                )}
                {selectedRequest.difficulties_overcome && (
                  <div>
                    <p className="font-medium text-muted-foreground">Difficulties Overcome</p>
                    <p>{selectedRequest.difficulties_overcome}</p>
                  </div>
                )}
                {selectedRequest.strengths && selectedRequest.strengths.length > 0 && (
                  <div>
                    <p className="font-medium text-muted-foreground">Key Strengths</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedRequest.strengths.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRequest.personal_notes && (
                  <div>
                    <p className="font-medium text-muted-foreground">Personal Notes</p>
                    <p>{selectedRequest.personal_notes}</p>
                  </div>
                )}
                {!hasAnswers && (
                  <p className="text-muted-foreground italic">
                    Student hasn't filled out the questionnaire yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Teacher Link */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link className="h-4 w-4 text-primary" />
                  Teacher Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedRequest.teacher_token ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Share this private link with{" "}
                      <strong>{selectedRequest.referee_name}</strong>
                      {selectedRequest.teacher_email && (
                        <> ({selectedRequest.teacher_email})</>
                      )}{" "}
                      so they can write the first draft directly.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/teacher-rec/${selectedRequest.teacher_token}`}
                        className="text-xs font-mono bg-muted"
                      />
                      <Button
                        variant="outline"
                        size="icon"
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
                      <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Teacher has submitted their draft — it's loaded in the editor.
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center">
                        Waiting for teacher to submit their draft…
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No teacher token found for this request.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Counselor Notes + Generate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Generation (fallback)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Counselor Notes <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Add any extra context or guidance for the AI..."
                    value={counselorNotes}
                    onChange={(e) => setCounselorNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !hasAnswers}
                  className="w-full"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? "Generating..." : "Generate with AI"}
                </Button>
                {!hasAnswers && (
                  <p className="text-xs text-muted-foreground text-center">
                    Waiting for student to complete questionnaire
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Letter */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Recommendation Letter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="The teacher's draft or AI-generated letter will appear here. You can edit directly."
                  value={generatedLetter || selectedRequest.generated_letter || selectedRequest.teacher_draft || ""}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  rows={20}
                  className="font-serif resize-none"
                />
                <Button
                  onClick={handleSend}
                  disabled={
                    sendLetter.isPending ||
                    (!generatedLetter && !selectedRequest.generated_letter && !selectedRequest.teacher_draft)
                  }
                  className="w-full"
                >
                  {sendLetter.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Letter to Student
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────────────────── */
  /* Main List View                */
  /* ───────────────────────────── */

  return (
    <div className="p-6 space-y-6">
      <CelebrationOverlay event={activeEvent} />
      <h1 className="text-3xl font-bold">Recommendation Letters</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Edit3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-foreground">{stats.sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              No requests found.
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((req) => (
            <Card
              key={req.id}
              onClick={() => {
                setSelectedRequest(req);
                setGeneratedLetter(req.generated_letter || "");
                setCounselorNotes(req.counselor_notes || "");
              }}
              className="cursor-pointer hover:shadow-md transition"
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={req.profiles?.avatar_url ?? undefined} alt={req.profiles?.full_name ?? ""} />
                  <AvatarFallback>
                    {(req.profiles?.full_name || "?").split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{req.profiles?.full_name || "Unknown Student"}</p>
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
                  {getStatusBadge(req.status)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CounselorRecommendationLetters;