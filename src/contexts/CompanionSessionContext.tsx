// Client state for the persistent Student AI Companion rail.
//
// Owns: conversation messages, sending state, page-context aggregation,
// the useNavigate() bridge for navigate actions, and sessionStorage sync.
//
// TODO(companion-v2): persist to student_companion_sessions once the memory
// layer lands. Swap sessionStorage sync at the marked locations.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  sendCompanionMessage,
  type CompanionMessage,
} from "@/hooks/useCompanionSend";
import {
  COMPANION_ROUTES,
  REC_DISMISS_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  TAB_STORAGE_KEY,
  type CompanionTab,
} from "@/components/companion/constants";

type PageContextExtras = Record<string, unknown>;

type CompanionState = {
  messages: CompanionMessage[];
};

type CompanionAction =
  | { type: "append"; message: CompanionMessage }
  | { type: "replace_last_assistant"; message: CompanionMessage }
  | { type: "reset" }
  | { type: "hydrate"; messages: CompanionMessage[] };

function reducer(state: CompanionState, action: CompanionAction): CompanionState {
  switch (action.type) {
    case "append":
      return { messages: [...state.messages, action.message] };
    case "replace_last_assistant": {
      const next = [...state.messages];
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === "assistant") {
          next[i] = action.message;
          return { messages: next };
        }
      }
      return { messages: [...next, action.message] };
    }
    case "reset":
      return { messages: [] };
    case "hydrate":
      return { messages: action.messages };
  }
}

type CompanionContextValue = {
  messages: CompanionMessage[];
  sending: boolean;
  isOpen: boolean;
  setOpen: (next: boolean) => void;
  toggleOpen: () => void;
  sendMessage: (text: string) => Promise<void>;
  resetSession: () => void;
  publishPageContext: (extras: PageContextExtras | null) => void;
  // Tab + recommendations
  activeTab: CompanionTab;
  setActiveTab: (next: CompanionTab) => void;
  hasChatUnread: boolean;
  dismissedRecs: Set<string>;
  dismissRec: (id: string) => void;
};

const CompanionSessionContext = createContext<CompanionContextValue | null>(null);

export function useCompanionSession(): CompanionContextValue {
  const ctx = useContext(CompanionSessionContext);
  if (!ctx) {
    // Return a no-op shape so pages that use useCompanionPageContext outside
    // the provider (e.g. counselor pages using shared components) don't crash.
    return {
      messages: [],
      sending: false,
      isOpen: false,
      setOpen: () => {},
      toggleOpen: () => {},
      sendMessage: async () => {},
      resetSession: () => {},
      publishPageContext: () => {},
      activeTab: "chat",
      setActiveTab: () => {},
      hasChatUnread: false,
      dismissedRecs: new Set(),
      dismissRec: () => {},
    };
  }
  return ctx;
}

// Small helper for id generation (crypto.randomUUID is available in modern
// browsers and shimmed by Vite's target).
function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function CompanionSessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, dispatch] = useReducer(reducer, { messages: [] });
  const [sending, setSending] = useState(false);
  const [isOpen, setOpenState] = useState(false);
  const pageExtrasRef = useRef<PageContextExtras | null>(null);
  const hydratedRef = useRef(false);

  // Tab + rec dismissal state
  const [activeTab, setActiveTabState] = useState<CompanionTab>("chat");
  const [dismissedRecs, setDismissedRecs] = useState<Set<string>>(() => new Set());
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
  const tabHydratedRef = useRef(false);
  const recsHydratedRef = useRef(false);

  // ── Hydrate from sessionStorage on mount ──────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.messages)) {
          dispatch({ type: "hydrate", messages: parsed.messages });
          const last = parsed.messages[parsed.messages.length - 1];
          if (last?.id) setLastSeenMessageId(last.id);
        }
      }
    } catch {
      /* ignore corrupt session */
    } finally {
      hydratedRef.current = true;
    }

    try {
      const tab = sessionStorage.getItem(TAB_STORAGE_KEY);
      if (tab === "chat" || tab === "path" || tab === "preview") {
        setActiveTabState(tab);
      }
    } catch {
      /* ignore */
    } finally {
      tabHydratedRef.current = true;
    }

    try {
      const raw = sessionStorage.getItem(REC_DISMISS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setDismissedRecs(new Set(parsed.filter((v): v is string => typeof v === "string")));
        }
      }
    } catch {
      /* ignore */
    } finally {
      recsHydratedRef.current = true;
    }
  }, []);

  // ── Sync to sessionStorage on change ──────────────────────────────────────
  // TODO(companion-v2): persist to student_companion_sessions instead.
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ messages: state.messages }),
      );
    } catch {
      /* quota / private mode — ignore */
    }
  }, [state.messages]);

  useEffect(() => {
    if (!tabHydratedRef.current) return;
    try {
      sessionStorage.setItem(TAB_STORAGE_KEY, activeTab);
    } catch {
      /* ignore */
    }
  }, [activeTab]);

  useEffect(() => {
    if (!recsHydratedRef.current) return;
    try {
      sessionStorage.setItem(
        REC_DISMISS_STORAGE_KEY,
        JSON.stringify(Array.from(dismissedRecs)),
      );
    } catch {
      /* ignore */
    }
  }, [dismissedRecs]);

  // When Chat becomes active, mark the newest message as seen.
  useEffect(() => {
    if (activeTab !== "chat") return;
    const latest = state.messages[state.messages.length - 1];
    setLastSeenMessageId(latest?.id ?? null);
  }, [activeTab, state.messages]);

  // ── Page-context publishing (route-scoped) ────────────────────────────────
  const publishPageContext = useCallback((extras: PageContextExtras | null) => {
    pageExtrasRef.current = extras;
  }, []);

  // Reset published extras on route change so stale IDs don't leak.
  useEffect(() => {
    pageExtrasRef.current = null;
  }, [location.pathname]);

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
  }, []);
  const toggleOpen = useCallback(() => setOpenState((v) => !v), []);

  const setActiveTab = useCallback((next: CompanionTab) => {
    setActiveTabState(next);
  }, []);

  const dismissRec = useCallback((id: string) => {
    setDismissedRecs((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: "reset" });
    setLastSeenMessageId(null);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // ── The send action ──────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      // Optimistic append of the user message
      const userMsg: CompanionMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };
      dispatch({ type: "append", message: userMsg });

      // Snapshot history to send (exclude nudges + errors + the just-appended
      // user turn is sent as `message`, not in history).
      const historyForServer = state.messages
        .filter((m) => !m.isNudge && !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      const pageContext = {
        route: location.pathname,
        params: pageExtrasRef.current ?? undefined,
      };

      setSending(true);
      const result = await sendCompanionMessage({
        message: trimmed,
        history: historyForServer,
        pageContext,
      });
      setSending(false);

      if (!result.ok) {
        dispatch({
          type: "append",
          message: {
            id: newId(),
            role: "assistant",
            content: result.error.message,
            isError: true,
            createdAt: Date.now(),
          },
        });
        return;
      }

      const assistantMsg: CompanionMessage = {
        id: newId(),
        role: "assistant",
        content: result.data.reply,
        actions: result.data.actions,
        createdAt: Date.now(),
      };
      dispatch({ type: "append", message: assistantMsg });

      // Apply navigate actions after the message is on screen.
      const nav = [...result.data.actions].reverse().find((a) => a.type === "navigate");
      if (nav && (COMPANION_ROUTES as readonly string[]).includes(nav.route)) {
        toast(nav.reason || "Taking you there…", { duration: 2200 });
        // brief delay so the toast + message render before the route swap
        window.setTimeout(() => navigate(nav.route), 250);
      }
    },
    [location.pathname, navigate, sending, state.messages],
  );

  const hasChatUnread = useMemo(() => {
    if (activeTab === "chat") return false;
    const latest = state.messages[state.messages.length - 1];
    if (!latest || latest.role !== "assistant") return false;
    return latest.id !== lastSeenMessageId;
  }, [activeTab, state.messages, lastSeenMessageId]);

  const value = useMemo<CompanionContextValue>(
    () => ({
      messages: state.messages,
      sending,
      isOpen,
      setOpen,
      toggleOpen,
      sendMessage,
      resetSession,
      publishPageContext,
      activeTab,
      setActiveTab,
      hasChatUnread,
      dismissedRecs,
      dismissRec,
    }),
    [
      state.messages,
      sending,
      isOpen,
      setOpen,
      toggleOpen,
      sendMessage,
      resetSession,
      publishPageContext,
      activeTab,
      setActiveTab,
      hasChatUnread,
      dismissedRecs,
      dismissRec,
    ],
  );

  return (
    <CompanionSessionContext.Provider value={value}>
      {children}
    </CompanionSessionContext.Provider>
  );
}
