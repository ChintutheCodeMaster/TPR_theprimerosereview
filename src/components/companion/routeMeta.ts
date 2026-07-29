import {
  Home,
  User,
  BarChart3,
  Plus,
  FileText,
  PenLine,
  Pencil,
  Beaker,
  Gauge,
  Award,
  Calculator,
  Trophy,
  Video,
  type LucideIcon,
} from "lucide-react";

export type RouteMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
};

export const ROUTE_META: Record<string, RouteMeta> = {
  "/student-dashboard": {
    label: "Dashboard",
    description: "Overview of your whole college journey.",
    icon: Home,
  },
  "/student-personal-area": {
    label: "Personal Area",
    description: "Your drafts and self-managed deadlines.",
    icon: User,
  },
  "/student-stats": {
    label: "Stats",
    description: "Application progress, essay completion, deadlines at a glance.",
    icon: BarChart3,
  },
  "/student-profile": {
    label: "Profile",
    description: "Your name, grade, contact, test scores.",
    icon: User,
  },
  "/add-application": {
    label: "Add Application",
    description: "Add a new college to your list.",
    icon: Plus,
  },
  "/submit-essay": {
    label: "Submit Essay",
    description: "Get AI feedback on structure, voice, and content.",
    icon: FileText,
  },
  "/personal-essay": {
    label: "Personal Statement",
    description: "Draft your personal statement.",
    icon: PenLine,
  },
  "/edit-essay": {
    label: "Edit Essay",
    description: "Edit an existing essay draft.",
    icon: Pencil,
  },
  "/primrose-lab": {
    label: "Primrose Lab",
    description: "AI writing playground — the first step of the essay journey.",
    icon: Beaker,
  },
  "/evaluation-engine": {
    label: "Evaluation Engine",
    description: "AI-scored application profile.",
    icon: Gauge,
  },
  "/scholarship-finder": {
    label: "Scholarship Finder",
    description: "Scholarships matched to your profile.",
    icon: Award,
  },
  "/tuition-calculator": {
    label: "Study Cost Planner",
    description: "Estimate tuition and living costs.",
    icon: Calculator,
  },
  "/weekly-challenge": {
    label: "Weekly Challenge",
    description: "The Primrose Challenge — a small weekly writing prompt.",
    icon: Trophy,
  },
  "/interview-simulator": {
    label: "Eva — Interview Simulator",
    description: "Practice interviews with AI.",
    icon: Video,
  },
};

export function lookupRouteMeta(pathname: string): RouteMeta | null {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];
  // fall back to longest-prefix match for /route/:id style
  const match = Object.keys(ROUTE_META)
    .filter((r) => pathname === r || pathname.startsWith(r + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTE_META[match] : null;
}
