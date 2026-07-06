import { useState } from "react";
import { motion } from "framer-motion";
import { StudentCard } from "@/components/StudentCard";
import { DashboardStats } from "@/components/DashboardStats";
import { CounselorInsights } from "@/components/CounselorInsights";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCounselorInvite } from "@/hooks/useCounselorInvite";
import { Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIndexDashboard } from "@/hooks/useIndexDashboard";
import { ActionItemsSection } from "@/components/ActionItemsSection";
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

const essayStatusClass = (status: string) => {
  switch (status) {
    case "sent":
      return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline";
    case "in_progress":
      return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
    case "draft":
      return "bg-white/[0.06] text-foreground/80 hairline";
    default:
      return "bg-white/[0.03] text-muted-foreground hairline";
  }
};

const Index = () => {
  const navigate = useNavigate();
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [studentsAtRiskOpen, setStudentsAtRiskOpen] = useState(false);
  const [essaysOpen, setEssaysOpen] = useState(false);

  const {
    students,
    studentsAtRisk,
    allStudents,
    essays,
    isLoadingStudents,
    isLoadingEssays,
  } = useIndexDashboard();

  const { data: inviteLink } = useCounselorInvite();

  return (
    <PageShell>
      <BlurOrb tone="pink" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />
      <BlurOrb tone="sage" className="bottom-[-120px] left-[-120px] w-[420px] h-[420px]" />

      <PageHeader
        eyebrow="Counselor"
        title={<>The week in your care.</>}
        subtitle={<>Every student, every draft — the roster only you can see.</>}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        <motion.div variants={sectionVariants}>
          <DashboardStats />
        </motion.div>

        {inviteLink && (
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="sage" className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Student registration link
                </p>
                <p className="text-xs text-muted-foreground break-all">{inviteLink}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </HairlineCard>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={sectionVariants}>
            <Collapsible open={studentsOpen} onOpenChange={setStudentsOpen}>
              <HairlineCard>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity gap-5">
                    <h2 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-3">
                      <Users className="h-5 w-5 text-[color:var(--pn-sage)]" />
                      Students needing you
                      <span className="text-xs font-sans text-muted-foreground bg-white/[0.05] hairline px-2 py-0.5 rounded-full">
                        {isLoadingStudents ? "…" : students.length}
                      </span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/add-student");
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add student
                      </Button>
                      {studentsOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-6">
                  {isLoadingStudents ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-30 text-muted-foreground" />
                      <p className="font-serif italic text-muted-foreground">
                        {allStudents.length === 0
                          ? "No students on your roster yet."
                          : "Everyone's steady for now."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {students.map((student) => (
                        <StudentCard
                          key={student.id}
                          student={student}
                          onViewStudent={(id) => navigate(`/students?id=${id}`)}
                        />
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </HairlineCard>
            </Collapsible>
          </motion.div>

          <motion.div variants={sectionVariants}>
            <Collapsible open={studentsAtRiskOpen} onOpenChange={setStudentsAtRiskOpen}>
              <HairlineCard>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity gap-5">
                    <h2 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-[color:var(--pn-pink)]" />
                      Students at risk
                      <span className="text-xs font-sans text-muted-foreground bg-white/[0.05] hairline px-2 py-0.5 rounded-full">
                        {isLoadingStudents ? "…" : studentsAtRisk.length}
                      </span>
                    </h2>
                    <div className="flex items-center gap-2">
                      {studentsAtRiskOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-6">
                  {isLoadingStudents ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : studentsAtRisk.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30 text-muted-foreground" />
                      <p className="font-serif italic text-muted-foreground">
                        {allStudents.length === 0
                          ? "No students on your roster yet."
                          : "No one's slipping. Quiet is a good sign."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {studentsAtRisk.map((student) => (
                        <StudentCard
                          key={student.id}
                          student={student}
                          onViewStudent={(id) => navigate(`/students?id=${id}`)}
                        />
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </HairlineCard>
            </Collapsible>
          </motion.div>
        </div>

        <motion.div variants={sectionVariants}>
          <Collapsible open={essaysOpen} onOpenChange={setEssaysOpen}>
            <HairlineCard>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
                  <h2 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[color:var(--pn-gold)]" />
                    Essays waiting on you
                    <span className="text-xs font-sans text-muted-foreground bg-white/[0.05] hairline px-2 py-0.5 rounded-full">
                      {isLoadingEssays ? "…" : essays.length}
                    </span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/essays");
                      }}
                    >
                      View all
                    </Button>
                    {essaysOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-6">
                {isLoadingEssays ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                  </div>
                ) : essays.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-30 text-muted-foreground" />
                    <p className="font-serif italic text-muted-foreground">
                      Nothing on your desk — yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {essays.map((essay) => (
                      <div
                        key={essay.id}
                        className="hairline rounded-lg p-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => navigate("/essays")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-lg text-foreground truncate">
                              {essay.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {essay.studentName}
                            </p>
                            {essay.prompt && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {essay.prompt}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${essayStatusClass(essay.status)}`}
                            >
                              {essay.status.replace("_", " ")}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {essay.lastUpdated}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground num-display">
                          {essay.wordCount} words
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </HairlineCard>
          </Collapsible>
        </motion.div>

        <motion.div variants={sectionVariants}>
          <CounselorInsights />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <ActionItemsSection />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-2xl text-foreground leading-tight">
                Where to next.
              </h3>
              <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Quick actions
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                onClick={() => navigate("/add-student")}
              >
                <Users className="h-5 w-5 text-[color:var(--pn-sage)]" />
                Add student
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                onClick={() => navigate("/essays")}
              >
                <FileText className="h-5 w-5 text-[color:var(--pn-gold)]" />
                Review essays
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                onClick={() => navigate("/check-deadlines")}
              >
                <Calendar className="h-5 w-5 text-[color:var(--pn-pink)]" />
                Check deadlines
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                onClick={() => navigate("/view-reports")}
              >
                <TrendingUp className="h-5 w-5 text-[color:var(--pn-sage)]" />
                View reports
              </Button>
            </div>
          </HairlineCard>
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default Index;
