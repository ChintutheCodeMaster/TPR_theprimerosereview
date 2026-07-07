import { FadeIn, Section } from "./motion";


const TIERS = [
  {
    name: "Spark",
    badge: "AI-first",
    price: "$79",
    per: "/ month",
    subtitle: "Get started. Build your profile. Plan your applications.",
    features: [
      "Unlimited AI admissions assistant",
      "Essay reviews in minutes",
      "Application timeline",
      "Smart document workspace",
      "Parent dashboard",
    ],
    cta: "Start with Spark",
    footer: "Best for independent applicants.",
    highlight: false,
  },
  {
    name: "Strategy",
    badge: "AI + Human",
    price: "$299",
    per: "/ month",
    subtitle: "AI operating system + monthly strategist.",
    features: [
      "Everything in Spark",
      "Dedicated admissions strategist",
      "Monthly strategy reviews",
      "School positioning",
      "Interview preparation",
      "Priority support",
    ],
    cta: "Start with Strategy",
    footer: "Most applicants choose this.",
    highlight: true,
  },
  {
    name: "Full Send",
    badge: "White-glove",
    price: "$999",
    per: "/ month",
    subtitle: "We become your admissions team.",
    features: [
      "Everything in Strategy",
      "Unlimited strategic guidance",
      "Former Dean review",
      "Priority turnaround",
      "Concierge application management",
    ],
    cta: "Apply for Full Send",
    footer: "Limited availability.",
    highlight: false,
  },
];


export function PricingV5() {
  return (
    <Section id="pricing" eyebrow="Pricing" className="bg-[#0a0a0a]">
      <FadeIn>
        <h2 className="max-w-4xl font-serif text-[34px] leading-[1.05] tracking-tight text-white sm:text-4xl md:text-6xl">
          Priced like software.
          <br />
          <span className="text-white/50">Delivered like a partner.</span>
        </h2>
      </FadeIn>

      <FadeIn delay={0.15}>
        <p className="mt-8 max-w-2xl font-serif text-xl leading-relaxed text-white/55 md:text-2xl">
          Most admissions consultants charge for meetings.
          <br />
          <span className="text-white/80">Primrose charges for momentum.</span>
        </p>
        <a
          href="#os"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-white/45 underline-offset-4 transition-colors hover:text-[#f7c8e0] hover:underline"
        >
          See what you get before you decide <span aria-hidden>→</span>
        </a>
      </FadeIn>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {TIERS.map((t, i) => (
          <FadeIn key={t.name} delay={0.1 + i * 0.1}>
            <div
              className={[
                "group relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-500 ease-out sm:p-8 md:p-10",
                "hover:-translate-y-1.5",
                t.highlight
                  ? "border-[#c9a8ff]/40 bg-gradient-to-b from-[#141020] to-[#0b0b0b] hover:border-[#c9a8ff]/70"
                  : "border-white/10 bg-[#0b0b0b] hover:border-white/25",
              ].join(" ")}
              style={
                t.highlight
                  ? { boxShadow: "0 40px 120px -30px rgba(201,168,255,0.35)" }
                  : undefined
              }
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="font-serif text-2xl text-white">{t.name}</div>
                <span
                  className={[
                    "rounded-full border px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest",
                    t.highlight
                      ? "border-[#c9a8ff]/50 text-[#c9a8ff]"
                      : "border-white/10 text-white/45",
                  ].join(" ")}
                >
                  {t.badge}
                </span>
              </div>

              <div className="mb-3 flex items-baseline gap-2">
                <span className="font-serif text-5xl text-white transition-transform duration-500 ease-out group-hover:scale-[1.03] origin-left sm:text-6xl">
                  {t.price}
                </span>
                <span className="text-[12px] text-white/45">{t.per}</span>
              </div>

              <p className="mb-10 text-[13px] leading-relaxed text-white/55">{t.subtitle}</p>

              <ul className="mb-12 space-y-3.5 border-t border-white/5 pt-6 text-[13px] text-white/75">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#c9a8ff]" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/login"
                className={[
                  "mt-auto inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-all duration-300 ease-out group-hover:-translate-y-0.5",
                  t.highlight
                    ? "bg-white text-black hover:bg-[#c9a8ff]"
                    : "border border-white/15 text-white hover:bg-white/5",
                ].join(" ")}
              >
                {t.cta}
              </a>

              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-white/60">
                Cancel anytime. No setup fees.
              </p>
              <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-widest text-white/60">
                {t.footer}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>

    </Section>
  );
}
