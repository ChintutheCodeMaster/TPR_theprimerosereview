import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Plus, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApplications } from "@/hooks/useApplications";
import { useCompanionSession } from "@/contexts/CompanionSessionContext";

type Rec = {
  id: string;
  label: string;
  sub?: string;
  route: string;
  icon: typeof Plus;
  tone: "default" | "warn";
};

function formatRelativeDeadline(iso: string): string {
  const target = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return "due today";
  if (diffDays === 1) return "due tomorrow";
  if (diffDays <= 14) return `due in ${diffDays} days`;
  return `due ${target.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export function CompanionRecommendationCard() {
  const navigate = useNavigate();
  const { applications } = useApplications();
  const { dismissedRecs, dismissRec } = useCompanionSession();

  const nearestDeadline = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = (applications ?? [])
      .filter(
        (a) =>
          a.deadline_date &&
          (a.completion_percentage ?? 0) < 100 &&
          new Date(a.deadline_date) >= today,
      )
      .sort((a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime());
    return upcoming[0] ?? null;
  }, [applications]);

  const recs: Rec[] = [
    {
      id: "add-app",
      label: "Add a new application",
      route: "/add-application",
      icon: Plus,
      tone: "default",
    },
    ...(nearestDeadline
      ? [
          {
            id: `deadline:${nearestDeadline.id}`,
            label: nearestDeadline.school_name,
            sub: formatRelativeDeadline(nearestDeadline.deadline_date),
            route: "/student-dashboard",
            icon: CalendarClock,
            tone: "warn" as const,
          },
        ]
      : []),
    {
      id: "weekly-challenge",
      label: "Complete this week's challenge",
      route: "/weekly-challenge",
      icon: Sparkles,
      tone: "default",
    },
  ];

  const visible = recs.filter((r) => !dismissedRecs.has(r.id));
  if (visible.length === 0) return null;

  return (
    <div className="px-3 pb-2 shrink-0">
      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-1.5">
        <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
          <span className="text-[10px] uppercase tracking-wider text-white/40">
            Suggested
          </span>
        </div>
        <div className="flex flex-col gap-1">
          {visible.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-2 py-1.5",
                  "bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.06] transition-colors",
                )}
              >
                <button
                  type="button"
                  onClick={() => navigate(r.route)}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <span
                    className={cn(
                      "h-6 w-6 rounded-lg flex items-center justify-center shrink-0",
                      r.tone === "warn"
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-white/[0.08] text-white/75",
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-white/85 leading-tight truncate">
                      {r.label}
                    </span>
                    {r.sub && (
                      <span
                        className={cn(
                          "block text-[10px] leading-tight mt-0.5",
                          r.tone === "warn" ? "text-amber-300/80" : "text-white/40",
                        )}
                      >
                        {r.sub}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => dismissRec(r.id)}
                  className="h-6 w-6 rounded-md flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/[0.08] transition-colors opacity-60 group-hover:opacity-100"
                  aria-label="Dismiss suggestion"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
