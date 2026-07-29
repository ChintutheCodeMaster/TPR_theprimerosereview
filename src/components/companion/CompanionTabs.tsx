import { MessageSquare, ListChecks, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanionSession } from "@/contexts/CompanionSessionContext";
import type { CompanionTab } from "./constants";

const TABS: Array<{ id: CompanionTab; label: string; icon: typeof MessageSquare }> = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "path", label: "Path", icon: ListChecks },
  { id: "preview", label: "Preview", icon: Compass },
];

export function CompanionTabs() {
  const { activeTab, setActiveTab, hasChatUnread } = useCompanionSession();

  return (
    <div className="px-3 pt-2 pb-2 shrink-0 border-b border-white/10">
      <div className="flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/10 p-0.5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          const showDot = id === "chat" && hasChatUnread;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-1.5 rounded-full",
                "px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                active
                  ? "bg-white/15 text-white/95 shadow-sm"
                  : "text-white/55 hover:text-white/80 hover:bg-white/[0.04]",
              )}
            >
              <Icon className="h-3 w-3" />
              <span>{label}</span>
              {showDot && (
                <span className="absolute top-1 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
