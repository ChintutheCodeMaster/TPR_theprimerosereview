import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import { COMPANION_ROUTES } from "./constants";
import { ROUTE_META, lookupRouteMeta } from "./routeMeta";

export function CompanionPreviewPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const meta = lookupRouteMeta(location.pathname);
  const Icon = meta?.icon ?? MapPin;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-4 scrollbar-thin">
      <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40">
          <MapPin className="h-3 w-3" />
          You are here
        </div>
        <div className="mt-2 flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-white/85" />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-lg text-white/95 leading-tight"
              style={{
                fontFamily: '"Instrument Serif", ui-serif, Georgia, serif',
                fontStyle: "italic",
              }}
            >
              {meta?.label ?? "This page"}
            </div>
            <div className="text-xs text-white/50 font-mono mt-0.5 truncate">
              {location.pathname}
            </div>
            <p className="text-xs text-white/70 mt-2 leading-relaxed">
              {meta?.description ??
                "This route isn't in the companion's map yet — I can still chat about it."}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/40 px-1 mb-2">
          Jump to
        </div>
        <div className="flex flex-col gap-1">
          {COMPANION_ROUTES.filter((r) => r !== location.pathname).map((r) => {
            const m = ROUTE_META[r];
            if (!m) return null;
            const RIcon = m.icon;
            return (
              <button
                key={r}
                type="button"
                onClick={() => navigate(r)}
                className="group flex items-center gap-2 rounded-xl px-2 py-2 text-left bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/15 transition-colors"
              >
                <span className="h-6 w-6 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                  <RIcon className="h-3 w-3 text-white/70" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-white/85 truncate">{m.label}</span>
                  <span className="block text-[10px] text-white/40 truncate">{m.description}</span>
                </span>
                <ArrowUpRight className="h-3 w-3 text-white/30 group-hover:text-white/70 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
