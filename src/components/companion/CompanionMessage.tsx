import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanionMessage as CompanionMessageType } from "@/hooks/useCompanionSend";

// Minimal inline markdown: **bold** + line breaks.
function renderRich(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
      if (chunk.startsWith("**") && chunk.endsWith("**")) {
        return <strong key={j} className="font-semibold">{chunk.slice(2, -2)}</strong>;
      }
      return <span key={j}>{chunk}</span>;
    });
    return (
      <span key={i}>
        {parts}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

export function CompanionMessage({ message }: { message: CompanionMessageType }) {
  const isUser = message.role === "user";
  const navAction = message.actions?.find((a) => a.type === "navigate");

  return (
    <div className={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")}>
      {message.isNudge && !isUser && (
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/40 pl-1">
          <Sparkles className="h-3 w-3" />
          <span>heads up</span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary/25 text-white border border-primary/30 rounded-br-md"
            : message.isError
              ? "bg-red-500/10 text-red-100 border border-red-500/25 rounded-bl-md"
              : "bg-white/[0.06] text-white/90 border border-white/10 rounded-bl-md",
        )}
      >
        {renderRich(message.content)}
      </div>
      {navAction && !isUser && (
        <div className="flex items-center gap-1.5 text-[11px] text-white/45 pl-1">
          <ArrowRight className="h-3 w-3" />
          <span>{navAction.route}</span>
        </div>
      )}
    </div>
  );
}
