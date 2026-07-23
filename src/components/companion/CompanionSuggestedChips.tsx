import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What's due this week?",
  "How am I doing on essays?",
  "Take me to add an application",
];

export function CompanionSuggestedChips({
  onPick,
  disabled,
}: {
  onPick: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <p className="text-[11px] uppercase tracking-wider text-white/40 pl-1">Try asking</p>
      <div className="flex flex-col gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onPick(s)}
            className={cn(
              "text-left text-xs text-white/75 px-3 py-2 rounded-lg",
              "bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-colors",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
