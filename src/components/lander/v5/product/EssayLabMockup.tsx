import { motion } from "framer-motion";
import { MessageSquare, Pin } from "lucide-react";

// Placeholder essay excerpt + comments. Swap for real Lab screenshot when ready.
export function EssayLabMockup() {
  return (
    <div
      data-placeholder="essay-lab"
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_40px_120px_-40px_rgba(247,200,224,0.15)]"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#f7c8e0]">
            Primrose Lab
          </span>
          <span className="text-white/40">·</span>
          <span>Common App · Personal statement · Draft 3</span>
        </div>
        <span className="font-mono text-[10px] text-white/40">auto-saved</span>
      </div>

      {/* Pinned strategist note */}
      <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-[#f7c8e0]/25 bg-[#f7c8e0]/[0.06] p-3">
        <Pin className="mt-0.5 h-4 w-4 text-[#f7c8e0]" />
        <div className="text-sm text-white/80">
          <span className="text-[#f7c8e0]">Strategist note · </span>
          The bones are here. The middle third is where you disappear. Slow down at the moment
          you actually decided.
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
        {/* Draft */}
        <div className="p-5 md:border-r md:border-white/5">
          <div className="mb-3 text-[11px] uppercase tracking-widest text-white/40">Your draft</div>
          <div className="space-y-3 text-[15px] leading-relaxed text-white/85">
            <p>
              I have always been <mark className="rounded bg-yellow-400/20 px-1 text-white/80 decoration-yellow-300/50">passionate about science</mark>,
              ever since I was young.
            </p>
            <p>
              In tenth grade, my chemistry teacher pulled me aside after class. She said something
              I still think about. <mark className="rounded bg-[#f7c8e0]/20 px-1 text-white/80">That moment changed everything for me.</mark>
            </p>
            <p>
              I started spending Saturdays in the lab. <mark className="rounded bg-sky-400/15 px-1 text-white/80">Slowly, the equations
              stopped being homework and started being questions I actually wanted to answer.</mark>
            </p>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-3 p-5">
          <div className="mb-1 text-[11px] uppercase tracking-widest text-white/40">Comments</div>

          <CommentCard tag="Voice" tone="yellow" text='"Passionate about science" is the phrase every essay opens with. What is the actual thing that pulls you in?' />
          <CommentCard tag="Specificity" tone="pink" text="What did she say? The whole moment collapses without that line." />
          <CommentCard tag="Story arc" tone="blue" text="This is the turn. Give us one Saturday, not the montage." />
        </div>
      </div>

      <div className="border-t border-white/5 px-5 py-3 text-[11px] text-white/40">
        Feedback tells you why. It doesn't rewrite your voice.
      </div>
    </div>
  );
}

function CommentCard({
  tag,
  tone,
  text,
}: {
  tag: string;
  tone: "yellow" | "pink" | "blue";
  text: string;
}) {
  const toneCls =
    tone === "yellow"
      ? "border-yellow-400/25 text-yellow-200/90"
      : tone === "pink"
      ? "border-[#f7c8e0]/30 text-[#f7c8e0]"
      : "border-sky-400/25 text-sky-200/90";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
        <MessageSquare className="h-3 w-3 text-white/40" />
        <span className={`rounded-full border px-2 py-0.5 ${toneCls}`}>{tag}</span>
      </div>
      <p className="mt-2 text-sm leading-snug text-white/80">{text}</p>
    </motion.div>
  );
}
