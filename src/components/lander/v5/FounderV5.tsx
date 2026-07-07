import tamirPhoto from "@/assets/tamir-bw.png";
import { FadeIn, Section } from "./motion";

export function FounderV5() {
  return (
    <Section id="founder" eyebrow="Founder">
      <div className="grid gap-14 md:grid-cols-[1fr_1.3fr] md:gap-20">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <img
              src={tamirPhoto}
              alt="Tamir Oren, Founder of Primrose"
              className="aspect-[4/5] w-full object-cover contrast-110"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5">
              <div className="font-serif text-xl text-white">Tamir Oren</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/60">
                Founder · Primrose
              </div>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="flex h-full flex-col justify-center">
            <blockquote className="font-serif text-[28px] leading-[1.15] tracking-tight text-white sm:text-3xl md:text-5xl">
              “I realized families weren't paying for expertise.
              <br />
              <span className="text-white/50">
                They were paying for administrative overhead.”
              </span>
            </blockquote>

            <div className="mt-10 max-w-xl space-y-4 text-[15px] leading-relaxed text-white/55">
              <p>
                Tamir studied at <span className="text-white/90">Imperial College London</span>, ranked the 2nd best university in the world. He is also a recipient of the prestigious <span className="text-white/90">Chevening Scholarship</span> from the British Foreign Office, an award given to future leaders worldwide.
              </p>
              <p>
                Originally from <span className="text-white/90">New York</span>, Tamir has spent over <span className="text-white/90">15 years</span> leading one of the top UK–US admissions consultancies, bringing the best practices from both sides of the Atlantic to guide students into the world's most selective universities.
              </p>
              <p>
                He assembled a team of talent from <span className="text-white/90">Netflix, Anthropic, Disney</span> and beyond to build Primrose. The old model was failing the very families it promised to serve. Scattered calls, PDFs, and calendar gaps had replaced real judgment.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/5 pt-8 sm:gap-8 sm:pt-10 md:mt-12">
              {[
                { n: "500+", l: "Students guided" },
                { n: "15+", l: "Years" },
                { n: "4", l: "Continents" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-serif text-3xl text-white sm:text-4xl md:text-5xl">{s.n}</div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-white/45">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
