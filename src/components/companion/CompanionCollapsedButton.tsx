import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompanionCollapsedButton({
  onOpen,
  hasUnread,
}: {
  onOpen: () => void;
  hasUnread?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Open Primrose Guide"
      className={cn(
        "fixed left-3 bottom-24 z-40 h-12 w-12 rounded-full",
        "bg-slate-950/85 backdrop-blur-xl border border-white/15",
        "flex items-center justify-center text-white/90",
        "shadow-lg shadow-black/40 hover:bg-slate-900 hover:border-white/25 transition-colors",
      )}
    >
      <Sparkles className="h-5 w-5" />
      {hasUnread && (
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border border-slate-950" />
      )}
    </button>
  );
}
