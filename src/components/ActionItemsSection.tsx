import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  AlertCircle,
  CalendarCheck,
  BookOpen,
  Users,
  Loader2,
  X,
} from "lucide-react";
import { useCounselorTasks, type TaskColor } from "@/hooks/useCounselorTasks";
import { useCounselorInsights } from "@/hooks/useCouncelorInsights";

// ── Color palette ────────────────────────────────────────────────────────────

const COLOR_OPTIONS: { value: TaskColor; label: string; bg: string; text: string; border: string; dot: string }[] = [
  { value: "blue",   label: "Blue",   bg: "bg-blue-500/10",   text: "text-blue-700",   border: "border-blue-300",   dot: "bg-blue-500"   },
  { value: "purple", label: "Purple", bg: "bg-purple-500/10", text: "text-purple-700", border: "border-purple-300", dot: "bg-purple-500" },
  { value: "green",  label: "Green",  bg: "bg-green-500/10",  text: "text-green-700",  border: "border-green-300",  dot: "bg-green-500"  },
  { value: "orange", label: "Orange", bg: "bg-orange-500/10", text: "text-orange-700", border: "border-orange-300", dot: "bg-orange-500" },
  { value: "pink",   label: "Pink",   bg: "bg-pink-500/10",   text: "text-pink-700",   border: "border-pink-300",   dot: "bg-pink-500"   },
  { value: "yellow", label: "Yellow", bg: "bg-yellow-500/10", text: "text-yellow-700", border: "border-yellow-300", dot: "bg-yellow-500" },
];

const getColor = (v: TaskColor) => COLOR_OPTIONS.find((c) => c.value === v) ?? COLOR_OPTIONS[0];

// ── System item icons ────────────────────────────────────────────────────────

const SYSTEM_ICONS: Record<string, React.ReactNode> = {
  "Recommendations": <Users   className="h-4 w-4" />,
  "Deadlines":       <CalendarCheck className="h-4 w-4" />,
  "Essays":          <BookOpen className="h-4 w-4" />,
};

const getSystemIcon = (label: string) => {
  const key = Object.keys(SYSTEM_ICONS).find((k) => label.includes(k));
  return key ? SYSTEM_ICONS[key] : <AlertCircle className="h-4 w-4" />;
};

const SYSTEM_COLORS = [
  "from-blue-500/10 to-blue-500/5 border-blue-200 text-blue-700",
  "from-orange-500/10 to-orange-500/5 border-orange-200 text-orange-700",
  "from-purple-500/10 to-purple-500/5 border-purple-200 text-purple-700",
];

// ── Add Task Form ────────────────────────────────────────────────────────────

const AddTaskForm = ({
  onAdd,
  onCancel,
  isPending,
}: {
  onAdd: (title: string, color: TaskColor) => void;
  onCancel: () => void;
  isPending: boolean;
}) => {
  const [title, setTitle]   = useState("");
  const [color, setColor]   = useState<TaskColor>("blue");

  return (
    <div className="border border-dashed border-border rounded-xl p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">New Task</p>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onCancel}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Textarea
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="min-h-[72px] text-sm resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && title.trim()) {
            onAdd(title.trim(), color);
          }
        }}
      />

      {/* Color picker */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground mr-1">Color:</span>
        {COLOR_OPTIONS.map((c) => (
          <button
            key={c.value}
            onClick={() => setColor(c.value)}
            className={`w-5 h-5 rounded-full ${c.dot} transition-all ${
              color === c.value ? "ring-2 ring-offset-1 ring-foreground/50 scale-110" : "opacity-60 hover:opacity-100"
            }`}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!title.trim() || isPending}
          onClick={() => onAdd(title.trim(), color)}
        >
          {isPending
            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            : <Plus className="h-3.5 w-3.5 mr-1" />}
          Add Task
        </Button>
        <p className="text-xs text-muted-foreground self-center">⌘↵ to submit</p>
      </div>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

export const ActionItemsSection = () => {
  const [showForm, setShowForm] = useState(false);

  const { tasks, isLoading, addTask, toggleDone, deleteTask, pending } = useCounselorTasks();
  const { data: insights } = useCounselorInsights();
  const systemItems = insights?.actionItems ?? [];

  const pendingTasks = tasks.filter((t) => !t.done);
  const doneTasks    = tasks.filter((t) => t.done);

  const handleAdd = (title: string, color: TaskColor) => {
    addTask.mutate({ title, color }, { onSuccess: () => setShowForm(false) });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Action Items</h2>
          {pending > 0 && (
            <Badge className="bg-destructive/10 text-destructive border-destructive/30 border">
              {pending} pending
            </Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-1.5" />Add Task
        </Button>
      </div>

      {/* System-generated items */}
      {systemItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {systemItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl border bg-gradient-to-br ${SYSTEM_COLORS[i % SYSTEM_COLORS.length]}`}
            >
              <div className="shrink-0">{getSystemIcon(item.label)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-tight">{item.label}</p>
              </div>
              <span className="text-2xl font-bold shrink-0">{item.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <AddTaskForm
          onAdd={handleAdd}
          onCancel={() => setShowForm(false)}
          isPending={addTask.isPending}
        />
      )}

      {/* Custom tasks */}
      <Card className="p-5">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : tasks.length === 0 && !showForm ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium mb-1">No tasks yet</p>
            <p className="text-xs mb-4">Add your daily action items to stay on top of your work.</p>
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />Add your first task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending */}
            {pendingTasks.length > 0 && (
              <div className="space-y-2">
                {pendingTasks.map((task) => {
                  const c = getColor(task.color);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${c.bg} ${c.border}`}
                    >
                      <button
                        className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => toggleDone.mutate({ id: task.id, done: true })}
                      >
                        <Circle className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                      </button>
                      <p className={`flex-1 text-sm font-medium ${c.text} leading-snug`}>{task.title}</p>
                      <button
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                        onClick={() => deleteTask.mutate(task.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Done */}
            {doneTasks.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                  Completed ({doneTasks.length})
                </p>
                {doneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30 opacity-60"
                  >
                    <button
                      className="mt-0.5 shrink-0 text-green-500"
                      onClick={() => toggleDone.mutate({ id: task.id, done: false })}
                    >
                      <CheckCircle2 className="h-[18px] w-[18px]" />
                    </button>
                    <p className="flex-1 text-sm line-through text-muted-foreground leading-snug">{task.title}</p>
                    <button
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                      onClick={() => deleteTask.mutate(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
