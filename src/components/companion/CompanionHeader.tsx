import { PanelLeftClose, RotateCcw, Sparkles } from "lucide-react";

export function CompanionHeader({
  onClose,
  onReset,
  canReset,
}: {
  onClose: () => void;
  onReset: () => void;
  canReset: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-white/15 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-white/90" />
        </div>
        <div className="leading-tight">
          <div
            className="text-sm text-white/95"
            style={{ fontFamily: '"Instrument Serif", ui-serif, Georgia, serif', fontStyle: "italic" }}
          >
            Primrose Guide
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Always here</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {canReset && (
          <button
            type="button"
            onClick={onReset}
            title="Start a new conversation"
            className="h-7 w-7 rounded-md flex items-center justify-center text-white/50 hover:text-white/90 hover:bg-white/[0.06] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          title="Collapse companion"
          className="h-7 w-7 rounded-md flex items-center justify-center text-white/50 hover:text-white/90 hover:bg-white/[0.06] transition-colors"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
