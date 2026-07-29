import { useEffect, useRef } from "react";
import { useCompanionSession } from "@/contexts/CompanionSessionContext";
import { CompanionMessage } from "./CompanionMessage";
import { CompanionSuggestedChips } from "./CompanionSuggestedChips";

export function CompanionMessages({
  onPickSuggestion,
}: {
  onPickSuggestion: (text: string) => void;
}) {
  const { messages, sending } = useCompanionSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, sending]);

  const empty = messages.length === 0;

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-3 scrollbar-thin"
    >
      {empty && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 px-3.5 py-3 text-sm text-white/85">
            <span
              style={{
                fontFamily: '"Instrument Serif", ui-serif, Georgia, serif',
                fontStyle: "italic",
              }}
              className="text-white/95"
            >
              Hi there.
            </span>{" "}
            I'm your Primrose Guide. Ask me anything about your applications, essays, or what to do next — I'll take you where you need to go.
          </div>
          <CompanionSuggestedChips disabled={sending} onPick={onPickSuggestion} />
        </div>
      )}

      {messages.map((m) => (
        <CompanionMessage key={m.id} message={m} />
      ))}

      {sending && (
        <div className="flex items-center gap-1.5 pl-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-pulse" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-pulse [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/50 animate-pulse [animation-delay:400ms]" />
        </div>
      )}
    </div>
  );
}
