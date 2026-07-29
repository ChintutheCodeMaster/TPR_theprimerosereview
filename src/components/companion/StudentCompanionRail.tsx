import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCompanionSession } from "@/contexts/CompanionSessionContext";
import { cn } from "@/lib/utils";
import {
  COLLAPSE_STORAGE_PREFIX,
  isStudentRoute,
  isWritingHeavy,
} from "./constants";
import { CompanionHeader } from "./CompanionHeader";
import { CompanionTabs } from "./CompanionTabs";
import { CompanionMessages } from "./CompanionMessages";
import { CompanionPathPanel } from "./CompanionPathPanel";
import { CompanionPreviewPanel } from "./CompanionPreviewPanel";
import { CompanionRecommendationCard } from "./CompanionRecommendationCard";
import { CompanionComposer, type CompanionComposerHandle } from "./CompanionComposer";
import { CompanionCollapsedButton } from "./CompanionCollapsedButton";
import { useCompanionNextSteps } from "@/hooks/useCompanionNextSteps";

// The rail self-gates on role so a role-state flicker at the App level
// doesn't unmount the provider and drop the conversation.
export function StudentCompanionRail() {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuthState();
  const isMobile = useIsMobile();
  const {
    messages,
    isOpen,
    setOpen,
    resetSession,
    activeTab,
    setActiveTab,
  } = useCompanionSession();

  const routeOpenTouched = useRef<Record<string, boolean>>({});
  const composerRef = useRef<CompanionComposerHandle>(null);

  // ── Look up role — cached via React Query so it survives remounts ─────────
  const { data: role, isSuccess: roleResolved } = useQuery({
    queryKey: ["companion", "role", user?.id ?? "anon"],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.role ?? null;
    },
    enabled: !isLoading && isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000,
  });

  const isStudentSurface = useMemo(() => isStudentRoute(location.pathname), [location.pathname]);

  const shouldRender = useMemo(() => {
    if (!roleResolved || !role) return false;
    if (!isStudentSurface) return false;
    return role === "student";
  }, [role, roleResolved, isStudentSurface]);

  // Prefetch next-steps when the rail mounts so switching to Path feels instant.
  useCompanionNextSteps(location.pathname, shouldRender);

  // ── Collapse defaults & per-route memory ─────────────────────────────────
  useEffect(() => {
    if (!shouldRender) return;
    const key = COLLAPSE_STORAGE_PREFIX + location.pathname;
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(key);
    } catch {
      /* ignore */
    }
    if (stored === "1") {
      setOpen(true);
      return;
    }
    if (stored === "0") {
      setOpen(false);
      return;
    }
    // No explicit preference: apply defaults.
    if (isMobile || isWritingHeavy(location.pathname)) {
      setOpen(false);
    } else {
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isMobile, shouldRender]);

  // Persist the user's toggle for this route.
  useEffect(() => {
    if (!shouldRender) return;
    if (!routeOpenTouched.current[location.pathname]) {
      // Skip the very first render for this route so we don't clobber defaults.
      routeOpenTouched.current[location.pathname] = true;
      return;
    }
    try {
      sessionStorage.setItem(COLLAPSE_STORAGE_PREFIX + location.pathname, isOpen ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [isOpen, location.pathname, shouldRender]);

  if (!shouldRender) return null;

  const hasUnread = !isOpen && messages.length > 0;

  const ease = [0.22, 1, 0.36, 1] as const;

  const handlePickSuggestion = (text: string) => {
    setActiveTab("chat");
    composerRef.current?.setDraft(text);
  };

  const handleBeforeSubmit = () => {
    if (activeTab !== "chat") setActiveTab("chat");
  };

  const railBody = (
    <>
      <CompanionHeader
        onClose={() => setOpen(false)}
        onReset={resetSession}
        canReset={messages.length > 0}
      />
      <CompanionTabs />
      {activeTab === "chat" && (
        <CompanionMessages onPickSuggestion={handlePickSuggestion} />
      )}
      {activeTab === "path" && <CompanionPathPanel />}
      {activeTab === "preview" && <CompanionPreviewPanel />}
      <CompanionRecommendationCard />
      <CompanionComposer ref={composerRef} onBeforeSubmit={handleBeforeSubmit} />
    </>
  );

  // Mobile: overlay drawer from the left. Desktop: inline column.
  if (isMobile) {
    return (
      <>
        <AnimatePresence initial={false}>
          {!isOpen && (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2, ease }}
            >
              <CompanionCollapsedButton onOpen={() => setOpen(true)} hasUnread={hasUnread} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                key="scrim"
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease }}
              />
              <motion.div
                key="drawer"
                className={cn(
                  "fixed left-0 top-0 bottom-0 z-50 w-[86vw] max-w-[380px]",
                  "flex flex-col bg-slate-950/95 backdrop-blur-xl border-r border-white/10",
                  "shadow-2xl shadow-black/60",
                )}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.32, ease }}
              >
                {railBody}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop
  return (
    <AnimatePresence initial={false} mode="wait">
      {isOpen ? (
        <motion.aside
          key="rail"
          className={cn(
            "hidden md:flex flex-col shrink-0 overflow-hidden w-[340px] lg:w-[360px]",
            "sticky top-0 h-screen",
            "bg-slate-950/85 backdrop-blur-xl border-r border-white/10",
            "text-white/90",
          )}
          initial={{ marginLeft: "-360px", opacity: 0 }}
          animate={{ marginLeft: 0, opacity: 1 }}
          exit={{ marginLeft: "-360px", opacity: 0 }}
          transition={{
            marginLeft: { duration: 0.35, ease },
            opacity: { duration: 0.25, ease, delay: 0.05 },
          }}
        >
          <div className="w-[340px] lg:w-[360px] h-full flex flex-col">
            {railBody}
          </div>
        </motion.aside>
      ) : (
        <motion.div
          key="collapsed"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.22, ease }}
        >
          <CompanionCollapsedButton onOpen={() => setOpen(true)} hasUnread={hasUnread} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
