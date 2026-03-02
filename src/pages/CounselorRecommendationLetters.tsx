import { useState, useMemo } from "react";
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
} from "lucide-react";

const CounselorRecommendationLetters = () => {
  const { toast } = useToast();
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
      const { data, error } = await fetch("/api/generate-recommendation", {
        method: "POST",
        body: JSON.stringify({
          requestId: selectedRequest.id,
          counselorNotes,
        }),
      }).then((res) => res.json());

      if (error) throw new Error(error);

      setGeneratedLetter(data.letter);

      await updateRequest.mutateAsync({
        id: selectedRequest.id,
        status: "in_progress",
        counselor_notes: counselorNotes,
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
    const studentName =
      selectedRequest.profiles?.full_name || "Unknown Student";

    return (
      <div className="p-6 space-y-6">
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

        <h1 className="text-2xl font-bold">{studentName}</h1>

        <Card>
          <CardHeader>
            <CardTitle>Recommendation Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedLetter || selectedRequest.generated_letter || ""}
              onChange={(e) => setGeneratedLetter(e.target.value)}
              rows={16}
              className="font-serif"
            />
          </CardContent>
        </Card>

        <Button
          onClick={handleSend}
          disabled={sendLetter.isPending}
          className="w-full"
        >
          {sendLetter.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send Letter
        </Button>
      </div>
    );
  }

  /* ───────────────────────────── */
  /* Main List View                */
  /* ───────────────────────────── */

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Recommendation Letters</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p>Total</p><p className="text-xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p>Pending</p><p className="text-xl font-bold">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p>In Progress</p><p className="text-xl font-bold">{stats.inProgress}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p>Sent</p><p className="text-xl font-bold">{stats.sent}</p></CardContent></Card>
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
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {req.profiles?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {req.referee_name}
                  </p>
                </div>
                {getStatusBadge(req.status)}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CounselorRecommendationLetters;