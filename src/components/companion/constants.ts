// Client-side mirrors of the server's route allowlist. Kept in sync manually
// with supabase/functions/student-companion/index.ts:ROUTE_MAP.

export const COMPANION_ROUTES: readonly string[] = [
  "/student-dashboard",
  "/student-personal-area",
  "/student-stats",
  "/student-profile",
  "/add-application",
  "/submit-essay",
  "/personal-essay",
  "/edit-essay",
  "/primrose-lab",
  "/evaluation-engine",
  "/scholarship-finder",
  "/tuition-calculator",
  "/weekly-challenge",
  "/interview-simulator",
] as const;

// Routes where the rail should default to collapsed — writing surfaces where
// horizontal space matters.
export const WRITING_HEAVY_ROUTES: readonly string[] = [
  "/edit-essay",
  "/submit-essay",
  "/personal-essay",
] as const;

export function isStudentRoute(pathname: string): boolean {
  return COMPANION_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

export function isWritingHeavy(pathname: string): boolean {
  return WRITING_HEAVY_ROUTES.some((r) => pathname === r || pathname.endsWith(r));
}

export const SESSION_STORAGE_KEY = "pp:companion:session";
export const COLLAPSE_STORAGE_PREFIX = "pp:companion:open:";
export const TAB_STORAGE_KEY = "pp:companion:tab";
export const REC_DISMISS_STORAGE_KEY = "pp:companion:rec-dismissed";

export type CompanionTab = "chat" | "path" | "preview";
