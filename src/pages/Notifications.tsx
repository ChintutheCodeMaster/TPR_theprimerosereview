import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  Bell,
  BellOff,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  MessageSquare,
  Calendar,
  User,
  School,
  Send,
  Eye,
  EyeOff,
  Trash2,
  TrendingUp,
  Archive,
  MoreHorizontal,
  Pause,
} from "lucide-react";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

type AppNotification = {
  id: string;
  type: 'essay' | 'application' | 'recommendation' | 'task' | 'message' | 'deadline';
  priority: 'critical' | 'important' | 'informational';
  title: string;
  description: string;
  studentName: string;
  studentId: string;
  studentAvatar?: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  linkedPage?: string;
  snoozed?: boolean;
  snoozeUntil?: string;
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

const Notifications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [showRead, setShowRead] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return ts;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.round(diffHours)} hour${Math.round(diffHours) !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${Math.round(diffDays)} day${Math.round(diffDays) !== 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const userId = userData.user.id;

      const { data: assignments } = await supabase
        .from("student_counselor_assignments")
        .select("student_id")
        .eq("counselor_id", userId);

      const studentIds = assignments?.map((a) => a.student_id) ?? [];
      if (studentIds.length === 0) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", studentIds);

      const profileMap: Record<string, any> = {};
      profileData?.forEach((p) => (profileMap[p.user_id] = p));

      const derived: AppNotification[] = [];

      const { data: apps } = await supabase
        .from("applications")
        .select("*")
        .in("student_id", studentIds);

      apps?.forEach((app) => {
        const student = profileMap[app.student_id];
        const studentName = student?.full_name ?? "Unknown Student";
        const deadline = new Date(app.deadline_date);
        const now = new Date();
        const daysUntil = Math.ceil(
          (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (app.urgent || daysUntil <= 1) {
          derived.push({
            id: `app-${app.id}`,
            type: "deadline",
            priority: "critical",
            title:
              daysUntil <= 0
                ? "Application Deadline Overdue"
                : "Application Deadline Tomorrow",
            description: `${app.school_name} — ${app.completed_essays}/${app.required_essays} essays complete`,
            studentName,
            studentId: app.student_id,
            studentAvatar: student?.avatar_url,
            timestamp: app.deadline_date,
            read: false,
            actionable: true,
            linkedPage: "/applications",
          });
        } else if (daysUntil <= 7) {
          derived.push({
            id: `app-${app.id}`,
            type: "deadline",
            priority: "important",
            title: `Application Due in ${daysUntil} Days`,
            description: `${app.school_name} — ${app.completed_essays}/${app.required_essays} essays complete`,
            studentName,
            studentId: app.student_id,
            studentAvatar: student?.avatar_url,
            timestamp: app.deadline_date,
            read: false,
            actionable: true,
            linkedPage: "/applications",
          });
        }
      });

      const { data: essays } = await supabase
        .from("essay_feedback")
        .select("*")
        .eq("counselor_id", userId)
        .in("student_id", studentIds);

      essays?.forEach((essay) => {
        if (essay.status !== "pending") return;
        const student = profileMap[essay.student_id];
        const studentName = student?.full_name ?? "Unknown Student";
        derived.push({
          id: `essay-${essay.id}`,
          type: "essay",
          priority: "important",
          title: "New Essay Submitted",
          description: `${essay.essay_title} — submitted for your review`,
          studentName,
          studentId: essay.student_id,
          studentAvatar: student?.avatar_url,
          timestamp: essay.updated_at ?? essay.created_at,
          read: false,
          actionable: true,
          linkedPage: "/essays",
        });
      });

      const { data: recs } = await supabase
        .from("recommendation_requests")
        .select("*")
        .in("student_id", studentIds)
        .in("status", ["pending", "in_progress"]);

      recs?.forEach((rec) => {
        const student = profileMap[rec.student_id];
        const studentName = student?.full_name ?? "Unknown Student";
        derived.push({
          id: `rec-${rec.id}`,
          type: "recommendation",
          priority: rec.status === "pending" ? "important" : "informational",
          title:
            rec.status === "pending"
              ? "Recommendation Letter Pending"
              : "Recommendation In Progress",
          description: `${rec.referee_name} — letter ${
            rec.status === "pending" ? "not yet started" : "in progress"
          }`,
          studentName,
          studentId: rec.student_id,
          studentAvatar: student?.avatar_url,
          timestamp: rec.updated_at ?? rec.created_at,
          read: rec.status === "in_progress",
          actionable: true,
          linkedPage: "/recommendation-letters",
        });
      });

      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .in("student_id", studentIds)
        .eq("completed", false);

      tasks?.forEach((task) => {
        const student = profileMap[task.student_id];
        const studentName = student?.full_name ?? "Unknown Student";
        const isOverdue =
          task.due_date && new Date(task.due_date) < new Date();
        derived.push({
          id: `task-${task.id}`,
          type: "task",
          priority: isOverdue ? "important" : "informational",
          title: isOverdue ? "Overdue Task" : "Pending Task",
          description: task.task,
          studentName,
          studentId: task.student_id,
          studentAvatar: student?.avatar_url,
          timestamp: task.due_date ?? task.created_at,
          read: !isOverdue,
          actionable: true,
        });
      });

      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .eq("counselor_id", userId);

      const convoIds = convos?.map((c) => c.id) ?? [];
      if (convoIds.length > 0) {
        const { data: unreadMsgs } = await supabase
          .from("messages")
          .select("*")
          .in("conversation_id", convoIds)
          .eq("read", false)
          .neq("sender_id", userId);

        unreadMsgs?.forEach((msg) => {
          const convo = convos?.find((c) => c.id === msg.conversation_id);
          if (!convo) return;
          const student = profileMap[convo.student_id];
          const studentName = student?.full_name ?? "Unknown Student";
          derived.push({
            id: `msg-${msg.id}`,
            type: "message",
            priority:
              convo.status === "urgent" ? "important" : "informational",
            title: "New Unread Message",
            description:
              msg.content.length > 80
                ? msg.content.substring(0, 80) + "..."
                : msg.content,
            studentName,
            studentId: convo.student_id,
            studentAvatar: student?.avatar_url,
            timestamp: msg.created_at,
            read: false,
            actionable: true,
            linkedPage: "/messages",
          });
        });
      }

      derived.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setNotifications(derived);
    };

    load();
  }, []);

  const dailyDigest = useMemo(() => {
    const active = notifications.filter((n) => !n.snoozed);
    const critical = active.filter((n) => n.priority === "critical");
    const essayDrafts = active.filter((n) => n.type === "essay");
    const pendingRecs = active.filter((n) => n.type === "recommendation");
    const importantCount = active.filter((n) => n.priority === "important").length;

    const priorities: {
      type: string;
      title: string;
      description: string;
      action: string;
    }[] = [];

    if (critical.length > 0) {
      priorities.push({
        type: "critical",
        title: `${critical.length} Critical Deadline${critical.length > 1 ? "s" : ""}`,
        description: critical[0].description,
        action: "Contact students immediately",
      });
    }
    if (essayDrafts.length > 0) {
      priorities.push({
        type: "important",
        title: `${essayDrafts.length} Essay Draft${essayDrafts.length > 1 ? "s" : ""} Awaiting Review`,
        description: `${essayDrafts[0].studentName}${
          essayDrafts.length > 1
            ? ` and ${essayDrafts.length - 1} other${essayDrafts.length > 2 ? "s" : ""}`
            : ""
        } submitted drafts`,
        action: "Schedule review session",
      });
    }
    if (pendingRecs.length > 0) {
      priorities.push({
        type: "important",
        title: `${pendingRecs.length} Pending Recommendation${pendingRecs.length > 1 ? "s" : ""}`,
        description: "Follow up with teachers for pending letters",
        action: "Send reminder emails",
      });
    }

    return {
      summary:
        critical.length > 0
          ? `You have ${critical.length} critical item${critical.length > 1 ? "s" : ""} requiring immediate attention today.`
          : importantCount > 0
          ? `You have ${importantCount} important item${importantCount > 1 ? "s" : ""} requiring attention.`
          : "You're clear. Nothing urgent today.",
      priorities: priorities.slice(0, 3),
    };
  }, [notifications]);

  const priorityPillClass = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline";
      case "important": return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
      case "informational": return "bg-white/[0.06] text-foreground/80 hairline";
      default: return "bg-white/[0.03] text-muted-foreground hairline";
    }
  };

  const priorityAccentBorder = (priority: string) => {
    switch (priority) {
      case "critical": return "border-l-[color:var(--pn-pink)]";
      case "important": return "border-l-[color:var(--pn-gold)]";
      case "informational": return "border-l-white/[0.08]";
      default: return "border-l-transparent";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return AlertTriangle;
      case "important": return AlertCircle;
      case "informational": return Bell;
      default: return Bell;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "essay": return FileText;
      case "application": return School;
      case "recommendation": return User;
      case "task": return CheckCircle;
      case "message": return MessageSquare;
      case "deadline": return Calendar;
      default: return Bell;
    }
  };

  const typeTone = (type: string) => {
    switch (type) {
      case "essay": return "var(--pn-sage)";
      case "application": return "var(--pn-sage)";
      case "recommendation": return "var(--pn-pink)";
      case "task": return "var(--pn-gold)";
      case "message": return "var(--pn-sage)";
      case "deadline": return "var(--pn-pink)";
      default: return "rgba(255,255,255,0.35)";
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    const matchesPriority =
      priorityFilter === "all" || notification.priority === priorityFilter;
    const matchesStudent =
      studentFilter === "all" || notification.studentName === studentFilter;
    const matchesRead = showRead || !notification.read;

    return (
      matchesSearch &&
      matchesType &&
      matchesPriority &&
      matchesStudent &&
      matchesRead &&
      !notification.snoozed
    );
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const snoozeNotification = (id: string, hours: number = 24) => {
    const snoozeUntil = new Date();
    snoozeUntil.setHours(snoozeUntil.getHours() + hours);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, snoozed: true, snoozeUntil: snoozeUntil.toISOString() }
          : n
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read && !n.snoozed).length;
  const criticalCount = notifications.filter(
    (n) => n.priority === "critical" && !n.read && !n.snoozed
  ).length;
  const snoozedCount = notifications.filter((n) => n.snoozed).length;

  const uniqueStudents = Array.from(
    new Set(notifications.map((n) => n.studentName))
  );

  const statTiles = [
    { label: "Total", value: notifications.length, icon: Bell, tone: "var(--pn-sage)" },
    { label: "Unread", value: unreadCount, icon: BellOff, tone: "var(--pn-gold)" },
    { label: "Critical", value: criticalCount, icon: AlertTriangle, tone: "var(--pn-pink)" },
    { label: "Snoozed", value: snoozedCount, icon: Clock, tone: "rgba(255,255,255,0.5)" },
  ];

  return (
    <PageShell>
      <BlurOrb tone="pink" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Notifications"
        title={<>What's calling for you.</>}
        subtitle={<>Deadlines, drafts, and threads — sorted by urgency.</>}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
              onClick={markAllAsRead}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive old
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

        {/* Daily Digest */}
        <motion.div variants={sectionVariants}>
          <HairlineCard variant="hero">
            <h3 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-[color:var(--pn-sage)]" />
              Today, in a sentence.
            </h3>
            <p className="text-foreground mb-4 font-serif italic">{dailyDigest.summary}</p>

            {dailyDigest.priorities.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {dailyDigest.priorities.map((priority, index) => (
                  <div key={index} className="hairline rounded-lg p-4 bg-white/[0.02]">
                    <div className="flex items-start gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] mt-0.5 ${priorityPillClass(priority.type)}`}
                      >
                        {priority.type}
                      </span>
                    </div>
                    <h4 className="font-serif text-lg text-foreground mt-2">{priority.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {priority.description}
                    </p>
                    <p className="text-xs text-[color:var(--pn-pink)] mt-2">
                      {priority.action}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </HairlineCard>
        </motion.div>

        {/* Filters */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search notifications…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px] bg-white/[0.02] hairline">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-pn-card hairline">
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="essay">Essays</SelectItem>
                    <SelectItem value="application">Applications</SelectItem>
                    <SelectItem value="recommendation">Recommendations</SelectItem>
                    <SelectItem value="task">Tasks</SelectItem>
                    <SelectItem value="message">Messages</SelectItem>
                    <SelectItem value="deadline">Deadlines</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[120px] bg-white/[0.02] hairline">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-pn-card hairline">
                    <SelectItem value="all">All priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="informational">Informational</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={studentFilter} onValueChange={setStudentFilter}>
                  <SelectTrigger className="w-[150px] bg-white/[0.02] hairline">
                    <SelectValue placeholder="Student" />
                  </SelectTrigger>
                  <SelectContent className="bg-pn-card hairline">
                    <SelectItem value="all">All students</SelectItem>
                    {uniqueStudents.map((student) => (
                      <SelectItem key={student} value={student}>
                        {student}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  className={`bg-transparent hairline hover:bg-white/[0.03] shadow-none ${showRead ? 'text-foreground' : 'text-muted-foreground'}`}
                  onClick={() => setShowRead(!showRead)}
                >
                  {showRead ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={sectionVariants} className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <HairlineCard variant="sage" className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-serif text-xl text-foreground mb-2">You're clear.</h3>
              <p className="font-serif italic text-muted-foreground">
                Try loosening the filters, or check back later.
              </p>
            </HairlineCard>
          ) : (
            filteredNotifications.map((notification) => {
              const TypeIcon = getTypeIcon(notification.type);
              const PriorityIcon = getPriorityIcon(notification.priority);
              const tone = typeTone(notification.type);

              return (
                <HairlineCard
                  key={notification.id}
                  className={`border-l-2 transition-colors ${priorityAccentBorder(notification.priority)} ${
                    !notification.read ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="hairline rounded-lg p-2" style={{ background: `${tone}20` }}>
                        <TypeIcon className="h-4 w-4" style={{ color: tone }} />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${priorityPillClass(notification.priority)}`}
                      >
                        <PriorityIcon className="h-3 w-3" />
                        {notification.priority}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`font-serif text-lg ${
                                !notification.read
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-[color:var(--pn-pink)] rounded-full" />
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.description}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-4 w-4 hairline">
                                <AvatarImage
                                  src={notification.studentAvatar}
                                  alt={notification.studentName}
                                />
                                <AvatarFallback className="text-[9px] bg-white/[0.04] text-foreground">
                                  {notification.studentName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>{notification.studentName}</span>
                            </div>
                            <span>·</span>
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            <span>·</span>
                            <span className="hairline rounded-full px-2 py-0.5 text-[10px] capitalize">
                              {notification.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          {notification.actionable && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>

                              {notification.type === "essay" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Review
                                </Button>
                              )}

                              {notification.type === "message" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Reply
                                </Button>
                              )}

                              {(notification.type === "deadline" ||
                                notification.type === "recommendation") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Remind
                                </Button>
                              )}
                            </>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm bg-pn-card hairline">
                              <DialogHeader>
                                <DialogTitle className="font-serif text-2xl text-foreground">
                                  What to do with it.
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                {!notification.read && (
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as read
                                  </Button>
                                )}

                                <Button
                                  variant="outline"
                                  className="w-full justify-start bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                                  onClick={() => snoozeNotification(notification.id, 24)}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Snooze for 24h
                                </Button>

                                <Button
                                  variant="outline"
                                  className="w-full justify-start bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                                  onClick={() => snoozeNotification(notification.id, 168)}
                                >
                                  <Pause className="h-4 w-4 mr-2" />
                                  Snooze for 1 week
                                </Button>

                                <Button
                                  variant="outline"
                                  className="w-full justify-start bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </HairlineCard>
              );
            })
          )}
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default Notifications;
