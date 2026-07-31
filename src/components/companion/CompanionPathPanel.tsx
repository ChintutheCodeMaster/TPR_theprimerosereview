import { useLocation, useNavigate } from "react-router-dom";
import { Check, CircleDashed, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanionNextSteps } from "@/hooks/useCompanionNextSteps";
import { useCompanionSession } from "@/contexts/CompanionSessionContext";

function StatusIcon({ status }: { status: "todo" | "in_progress" | "done" }) {
  if (status === "done") return <Check className="h-3 w-3 text-emerald-400" />;
  if (status === "in_progress")
    return <Loader2 className="h-3 w-3 text-amber-300 animate-spin" />;
  return <CircleDashed className="h-3 w-3 text-white/50" />;
}

export function CompanionPathPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeTab } = useCompanionSession();
  const {
    data: steps,
    isLoading,
    isError,
    regenerate,
    isFetching,
  } = useCompanionNextSteps(location.pathname, activeTab === "path");

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-3 scrollbar-thin">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/45">
          <Sparkles className="h-3 w-3" />
          Your path forward
        </div>
        <button
          type="button"
          onClick={() => regenerate()}
          disabled={isFetching}
          className="h-6 w-6 rounded-md flex items-center justify-center text-white/40 hover:text-white/85 hover:bg-white/[0.06] disabled:opacity-40 transition-colors"
          title="Regenerate"
        >
          <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-11 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse"
            />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">
          <div>Couldn't load your next steps.</div>
          <button
            type="button"
            onClick={() => regenerate()}
            className="mt-2 text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && steps && steps.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/70 text-center">
          <span
            className="block text-base mb-1 text-white/95"
            style={{
              fontFamily: '"Instrument Serif", ui-serif, Georgia, serif',
              fontStyle: "italic",
            }}
          >
            You're all caught up.
          </span>
          Nothing urgent right now — nice work.
        </div>
      )}

      {!isLoading && !isError && steps && steps.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {steps.map((step, i) => (
            <button
              key={step.id + i}
              type="button"
              disabled={!step.route}
              onClick={() => step.route && navigate(step.route)}
              className={cn(
                "group flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-left",
                "bg-white/[0.03] border border-white/[0.06] transition-colors",
                step.route
                  ? "hover:bg-white/[0.07] hover:border-white/15 cursor-pointer"
                  : "cursor-default",
                step.status === "done" && "opacity-60",
              )}
            >
              <span className="h-5 w-5 rounded-md bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                <StatusIcon status={step.status} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-xs leading-snug",
                    step.status === "done"
                      ? "text-white/50 line-through"
                      : "text-white/85",
                  )}
                >
                  {step.label}
                </span>
                {step.route && (
                  <span className="block text-[10px] text-white/35 mt-0.5 font-mono">
                    {step.route}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
