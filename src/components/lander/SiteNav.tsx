import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PrimroseLogoBadge } from "@/components/lander/PrimroseLogo";

const linksByRoute: Record<string, { href: string; label: string }[]> = {
  "/": [
    { href: "/#why", label: "The shift" },
    { href: "/#os", label: "Operating System" },
    { href: "/#experts", label: "Founder" },
    { href: "/#pricing", label: "Pricing" },
  ],
  "/v5": [
    { href: "/v5#shift", label: "The shift" },
    { href: "/v5#intelligence", label: "Intelligence" },
    { href: "/v5#os", label: "Operating System" },
    { href: "/v5#pricing", label: "Pricing" },
  ],
};

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const path = useLocation().pathname;
  const isV5 = path.startsWith("/v5");
  const isDarkRoute = isV5;
  const version: "/" | "/v5" = isV5 ? "/v5" : "/";
  const links = linksByRoute[version];
  const onDark = isDarkRoute;

  return (
    <header className={onDark
      ? "sticky top-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl"
      : "sticky top-0 z-50 border-b border-hairline bg-background/80 backdrop-blur-xl"}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to={version} className="flex items-center gap-2">
          <PrimroseLogoBadge size={28} variant={onDark ? "dark" : "light"} />
          <span className={onDark
            ? "font-serif text-xl tracking-tight text-white"
            : "font-serif text-xl tracking-tight text-ink"}>Primrose</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={onDark
                ? "text-sm text-white/60 transition-colors hover:text-white"
                : "text-sm text-ink-soft transition-colors hover:text-ink"}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild className={onDark
            ? "rounded-full bg-white text-black hover:bg-[#f7c8e0]"
            : "rounded-full bg-ink text-cream hover:bg-ink/90"}>
            <Link to="/login">Start your application</Link>
          </Button>
        </div>

        <button
          className="rounded-md p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-hairline bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-md px-2 py-2 text-sm text-ink-soft hover:bg-muted hover:text-ink"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <Button asChild className="mt-2 rounded-full bg-ink text-cream hover:bg-ink/90">
              <Link to="/login" onClick={() => setOpen(false)}>Start your application</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
