import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanionSession } from "@/contexts/CompanionSessionContext";
import { CompanionMessage } from "./CompanionMessage";
import { CompanionSuggestedChips } from "./CompanionSuggestedChips";

export function CompanionChat() {
  const { messages, sending, sendMessage } = useCompanionSession();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft("");
    // Reset textarea height after clearing
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await sendMessage(text);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Scrollable message region */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 scrollbar-thin"
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
            <CompanionSuggestedChips
              disabled={sending}
              onPick={(t) => {
                setDraft(t);
                textareaRef.current?.focus();
              }}
            />
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

      {/* Composer */}
      <div className="border-t border-white/10 p-3 shrink-0">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl bg-white/[0.05] border border-white/10 px-3 py-2",
            "focus-within:border-white/25 transition-colors",
          )}
        >
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={handleKey}
            placeholder={sending ? "Thinking…" : "Ask anything about your journey"}
            rows={1}
            disabled={sending}
            className={cn(
              "flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/35",
              "resize-none outline-none max-h-[140px]",
            )}
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || sending}
            className={cn(
              "shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
              "bg-primary/80 text-primary-foreground hover:bg-primary transition-colors",
              "disabled:opacity-30 disabled:cursor-not-allowed",
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-white/30 mt-1.5 pl-1">
          I can navigate and look things up — I can't edit anything for you yet.
        </p>
      </div>
    </div>
  );
}
