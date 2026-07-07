import { SiteNav } from "@/components/lander/SiteNav";
import { PrimroseLogoBadge } from "@/components/lander/PrimroseLogo";
import { HeroV5 } from "./HeroV5";
import { TheShift } from "./TheShift";
import { Intelligence } from "./Intelligence";
import { TestimonialsV5 } from "./TestimonialsV5";
import { OperatingSystem } from "./OperatingSystem";
import { FounderV5 } from "./FounderV5";
import { PricingV5 } from "./PricingV5";

export function V5Page() {
  return (
    <div className="v5 min-h-screen bg-[#080808] text-white/90 antialiased selection:bg-[#f7c8e0]/30">
      <SiteNav />
      <main>
        <HeroV5 />
        <TheShift />
        <Intelligence />
        <TestimonialsV5 />
        <OperatingSystem />
        <FounderV5 />
        <PricingV5 />
      </main>
      <footer className="border-t border-white/5 bg-[#050505]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-4 md:py-14">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <PrimroseLogoBadge size={28} variant="dark" />
              <span className="font-serif text-xl tracking-tight text-white">Primrose</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-white/40">
              The Admissions Intelligence Platform. Built for how students actually apply today.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-white/30">Platform</div>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li><a href="#shift" className="hover:text-white transition-colors">The shift</a></li>
              <li><a href="#intelligence" className="hover:text-white transition-colors">Intelligence</a></li>
              <li><a href="#os" className="hover:text-white transition-colors">Operating System</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-white/30">Company</div>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li><a href="#founder" className="hover:text-white transition-colors">Founder</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Results</a></li>
              <li><span className="text-white/40">Contact</span></li>
              <li><span className="text-white/40">Privacy</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 text-xs text-white/30 sm:px-6">
            <span>© {new Date().getFullYear()} Primrose Admissions</span>
            <span>Made with care.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
