import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeacherEssays, type TeacherEssay } from "@/hooks/useTeacherEssays";
import { TeacherEssayFeedbackModal } from "@/components/teacher-feedback/TeacherEssayFeedbackModal";
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
} from "lucide-react";

const statusConfig = {
  pending:   { label: "Pending",   icon: AlertCircle,  cls: "border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-950/20" },
  reviewing: { label: "Reviewing", icon: Clock,        cls: "border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
  reviewed:  { label: "Reviewed",  icon: CheckCircle,  cls: "border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" },
};

const TeacherEssays = () => {
  const { data: essays = [], isLoading } = useTeacherEssays();
  const [searchTerm, setSearchTerm]       = useState("");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [selectedEssay, setSelectedEssay] = useState<TeacherEssay | null>(null);

  const filtered = essays.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || e.teacherStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:    essays.length,
    pending:  essays.filter((e) => e.teacherStatus === "pending").length,
    reviewed: essays.filter((e) => e.teacherStatus === "reviewed").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Essays</h1>
        <p className="text-muted-foreground">Student essays shared with you for review</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",    value: stats.total,    color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/20",    icon: FileText    },
          { label: "Pending",  value: stats.pending,  color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/20",  icon: Clock       },
          { label: "Reviewed", value: stats.reviewed, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: CheckCircle },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by essay title or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Essay list */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">
              {essays.length === 0 ? "No essays yet" : "No essays match your filters"}
            </p>
            <p className="text-xs text-muted-foreground">
              {essays.length === 0
                ? "Essays will appear here when students share them with you."
                : "Try adjusting your search or status filter."}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((essay) => {
          const cfg = statusConfig[essay.teacherStatus as keyof typeof statusConfig] ?? statusConfig.pending;
          const StatusIcon = cfg.icon;
          return (
            <Card
              key={essay.shareId}
              className="cursor-pointer hover:shadow-md transition-all group"
              onClick={() => setSelectedEssay(essay)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-600 text-white text-xs font-semibold">
                      {essay.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-purple-600 transition-colors">
                      {essay.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{essay.studentName}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs shrink-0 flex items-center gap-1 ${cfg.cls}`}>
                    <StatusIcon className="h-3 w-3" />
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{essay.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{essay.wordCount} words</span>
                  <div className="flex items-center gap-2">
                    {essay.aiScore && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        {essay.aiScore}/100
                      </span>
                    )}
                    <span>Shared {new Date(essay.sharedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedEssay && (
        <TeacherEssayFeedbackModal
          isOpen={!!selectedEssay}
          onClose={() => setSelectedEssay(null)}
          essay={{
            shareId:     selectedEssay.shareId,
            essayId:     selectedEssay.essayId,
            title:       selectedEssay.title,
            studentName: selectedEssay.studentName,
            studentId:   selectedEssay.studentId,
            prompt:      selectedEssay.prompt,
            content:     selectedEssay.content,
          }}
        />
      )}
    </div>
  );
};

export default TeacherEssays;
