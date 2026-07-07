import { FadeIn, Section } from "./motion";
import { motion } from "framer-motion";

const sofiaPortrait = { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80&auto=format&fit=crop" };
const danielNewPortrait = { url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=80&auto=format&fit=crop" };
const noahPortrait = { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80&auto=format&fit=crop" };

const TESTIMONIALS = [
  {
    name: "Sofia M.",
    school: "Yale",
    cycle: "2025",
    photo: sofiaPortrait.url,
    quote:
      "I wasn't looking for someone to rewrite my essay. I just needed someone to tell me why it wasn't working. That made all the difference.",
    highlight: "First draft I was excited to submit",
  },
  {
    name: "Daniel K.",
    school: "MIT",
    cycle: "2025",
    photo: danielNewPortrait.url,
    quote:
      "Early Action was stressful. Having someone actually respond when things came up made a bigger difference than I expected.",
    highlight: "Answered me at 11:04 PM",
  },
  {
    name: "Ava R.",
    school: "Princeton",
    cycle: "2026",
    photo:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=900&q=80&auto=format&fit=crop",
    quote:
      "My parents stopped asking me every day if I'd worked on my applications because they could actually see the progress.",
    highlight: "My parents could follow everything",
  },
  {
    name: "Noah B.",
    school: "Stanford",
    cycle: "2026",
    photo: noahPortrait.url,
    quote:
      "I expected ChatGPT with a nicer interface. What I got was something that kept asking better questions until my own story started making sense.",
    highlight: "Caught every generic sentence",
  },
];

// Elegant serif wordmarks in place of hotlinked logos — reliably rendered,
// premium aesthetic, and each university color-tinted.
const UNIVERSITIES = [
  { name: "Yale", color: "#0F4D92" },
  { name: "MIT", color: "#A31F34" },
  { name: "Princeton", color: "#E77500" },
  { name: "Stanford", color: "#8C1515" },
  { name: "Harvard", color: "#A51C30" },
  { name: "Columbia", color: "#B9D9EB" },
  { name: "Penn", color: "#990000" },
  { name: "Cornell", color: "#B31B1B" },
  { name: "Brown", color: "#4E3629" },
  { name: "Dartmouth", color: "#00693E" },
];

function Crest({ name, color }: { name: string; color: string }) {
  const initial = name === "MIT" || name === "Penn" ? name : name[0];
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15"
        style={{ background: `linear-gradient(180deg, ${color}22, transparent)` }}
      >
        <span
          className="font-serif text-[13px] leading-none"
          style={{ color: color }}
        >
          {initial}
        </span>
        <span
          className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/5"
        />
      </div>
      <span className="font-serif text-[15px] tracking-tight text-white/85">
        {name}
      </span>
    </div>
  );
}

export function TestimonialsV5() {
  return (
    <Section id="testimonials" eyebrow="What students say" className="relative overflow-visible">
      {/* soft pink glow behind the grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-40 blur-3xl md:h-[800px] md:w-[800px]"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(247,200,224,0.12), transparent 70%)" }}
      />

      <FadeIn>
        <h2 className="max-w-4xl font-serif text-[34px] leading-[1.05] tracking-tight text-white sm:text-4xl md:text-6xl">
          The students who{" "}
          <span className="italic text-[#f7c8e0]">made it.</span>
        </h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/50">
          Real students. Real admissions. Their words.
        </p>
      </FadeIn>

      <div className="mt-16 grid gap-6 md:grid-cols-2 md:gap-8">
        {TESTIMONIALS.map((t, i) => {
          const uni = UNIVERSITIES.find((u) => u.name === t.school)!;
          return (
            <FadeIn key={t.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0c] transition-colors duration-500 hover:border-[#f7c8e0]/30"
                style={{ boxShadow: "0 0 0 0 rgba(247,200,224,0)" }}
              >
                {/* subtle top-edge pink sheen on hover */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f7c8e0]/0 to-transparent transition-all duration-500 group-hover:via-[#f7c8e0]/40" />

                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={t.photo}
                    alt={t.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/40 to-transparent" />

                  {/* University crest */}
                  <div className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/50 px-2.5 py-1.5 backdrop-blur">
                    <Crest name={uni.name} color={uni.color} />
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <div className="font-serif text-xl text-white">{t.name}</div>
                    <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/60">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#f7c8e0]" />
                      Admitted · Class of {t.cycle}
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <div className="p-6">
                  <blockquote className="font-serif text-lg leading-relaxed text-white/80 md:text-xl">
                    “{t.quote}”
                  </blockquote>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/50 transition-colors duration-300 group-hover:border-[#f7c8e0]/25 group-hover:bg-[#f7c8e0]/5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7c8e0]" />
                    {t.highlight}
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          );
        })}
      </div>
    </Section>
  );
}
