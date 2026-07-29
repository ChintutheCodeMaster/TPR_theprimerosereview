import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanionSession } from "@/contexts/CompanionSessionContext";

export type CompanionComposerHandle = {
  focus: () => void;
  setDraft: (text: string) => void;
};

export const CompanionComposer = forwardRef<
  CompanionComposerHandle,
  { onBeforeSubmit?: () => void }
>(function CompanionComposer({ onBeforeSubmit }, ref) {
  const { sending, sendMessage } = useCompanionSession();
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    setDraft: (text: string) => {
      setDraft(text);
      // resize on the next tick
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
        el.focus();
      });
    },
  }));

  useEffect(() => {
    if (!draft && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [draft]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    onBeforeSubmit?.();
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await sendMessage(text);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  return (
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
  );
});
