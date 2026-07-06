import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import { Star, Send, Heart, Loader2 } from "lucide-react";

const CATEGORIES = [
  { label: "Platform Experience", emoji: "✨" },
  { label: "Counselor Support",   emoji: "🤝" },
  { label: "Essay Help",          emoji: "✍️" },
  { label: "General Feedback",    emoji: "💬" },
  { label: "Suggestions",         emoji: "💡" },
];

const MOODS = [
  { emoji: "😍", label: "Love it!" },
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😕", label: "Could be better" },
  { emoji: "😤", label: "Frustrated" },
];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Amazing"];

const ACCENT_ROTATION = [
  "var(--pn-pink)",
  "var(--pn-sage)",
  "var(--pn-gold)",
];

const sectionVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] as const } },
};

const StudentFeedback = () => {
  const { toast } = useToast();

  const [rating, setRating]           = useState(0);
  const [hovered, setHovered]         = useState(0);
  const [category, setCategory]       = useState("");
  const [mood, setMood]               = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [history, setHistory]         = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [firstName, setFirstName]     = useState("there");
  const [userId, setUserId]           = useState("");
  const [fullName, setFullName]       = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const name = profile?.full_name ?? "Student";
      setFullName(name);
      setFirstName(name.split(" ")[0]);

      const { data } = await supabase
        .from("feedback_student")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      setHistory(data ?? []);
      setLoadingHistory(false);
    };
    init();
  }, []);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast({ title: "Please write your feedback first!", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { data: inserted, error: dbError } = await supabase
      .from("feedback_student")
      .insert({
        student_id: userId,
        student_name: fullName,
        feedback_text: feedbackText.trim(),
        rating: rating || null,
        category: category || null,
        mood: mood || null,
      })
      .select()
      .single();

    if (dbError) {
      toast({ title: "Failed to save feedback", description: dbError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    supabase.functions.invoke("student-feedback", {
      body: {
        studentName: fullName,
        feedbackText: feedbackText.trim(),
        rating: rating || null,
        category: category || null,
        mood: mood || null,
        submittedAt: new Date().toISOString(),
      },
    }).catch((e) => console.warn("student-feedback edge function:", e));

    if (inserted) setHistory((prev) => [inserted, ...prev]);

    setJustSubmitted(true);
    setRating(0);
    setCategory("");
    setMood("");
    setFeedbackText("");
    toast({ title: "Thank you 🎉", description: "Your feedback has been received." });
    setTimeout(() => setJustSubmitted(false), 3000);
    setSubmitting(false);
  };

  return (
    <PageShell maxWidth="wide">
      <BlurOrb tone="sage" className="top-[-100px] left-[-100px] w-[500px] h-[500px]" />
      <BlurOrb tone="pink" className="bottom-[-80px] right-[-80px] w-[380px] h-[380px]" />

      <PageHeader
        eyebrow="Your voice"
        title={<>Tell us, honestly.</>}
        subtitle={<>Hey {firstName} — we read every word you write here.</>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left: Form ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="lg:col-span-3 space-y-6"
        >

          {/* Star Rating */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="mb-4">
                <h3 className="font-serif text-xl text-foreground leading-tight">How was it, really?</h3>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Tap a star to rate</p>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s === rating ? 0 : s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-9 w-9 transition-colors duration-150 ${
                        s <= (hovered || rating)
                          ? "fill-[color:var(--pn-gold)] text-[color:var(--pn-gold)]"
                          : "fill-white/[0.04] text-white/20"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-serif italic text-[color:var(--pn-gold)]">
                    {RATING_LABELS[rating]}
                  </span>
                )}
              </div>
            </HairlineCard>
          </motion.div>

          {/* Category */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="mb-4">
                <h3 className="font-serif text-xl text-foreground leading-tight">What is it about?</h3>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Optional</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(category === cat.label ? "" : cat.label)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all hairline ${
                      category === cat.label
                        ? "bg-white/[0.08] text-foreground"
                        : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </HairlineCard>
          </motion.div>

          {/* Mood */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="mb-4">
                <h3 className="font-serif text-xl text-foreground leading-tight">And how are you feeling?</h3>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Optional</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {MOODS.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setMood(mood === m.label ? "" : m.label)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all hairline ${
                      mood === m.label
                        ? "bg-white/[0.08] text-foreground"
                        : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                    }`}
                  >
                    <span className="text-3xl leading-none">{m.emoji}</span>
                    <span className="text-xs whitespace-nowrap mt-1">{m.label}</span>
                  </button>
                ))}
              </div>
            </HairlineCard>
          </motion.div>

          {/* Text */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="mb-4">
                <h3 className="font-serif text-xl text-foreground leading-tight">Say more.</h3>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Anything on your mind — we read every word</p>
              </div>
              <Textarea
                placeholder="What's been great? What could be improved? Any ideas or suggestions? Go for it..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[160px] resize-none font-serif text-base leading-relaxed bg-white/[0.02] hairline"
              />
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2 text-right">
                <span className="num-display">{feedbackText.length}</span> characters
              </p>
            </HairlineCard>
          </motion.div>

          {/* Submit */}
          <motion.div variants={sectionVariants}>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !feedbackText.trim()}
              className={`w-full py-6 rounded-2xl text-base transition-all shadow-none hairline ${
                justSubmitted
                  ? "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hover:bg-[color:var(--pn-sage)]/25"
                  : "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hover:bg-[color:var(--pn-pink)]/25 disabled:opacity-50"
              }`}
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Sending your feedback…</>
              ) : justSubmitted ? (
                <>🎉 Thank you so much!</>
              ) : (
                <><Send className="h-5 w-5 mr-2" /> Submit Feedback</>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* ── Right: History ── */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Heart className="h-4 w-4 text-[color:var(--pn-pink)] fill-[color:var(--pn-pink)]/40" />
            <h2 className="font-serif text-xl text-foreground leading-tight">Everything you've said.</h2>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <HairlineCard variant="sage" className="text-center py-12 px-6">
              <p className="text-5xl mb-4">🌟</p>
              <p className="font-serif text-lg text-foreground mb-1">Nothing said yet.</p>
              <p className="font-serif italic text-sm text-muted-foreground">Be the first to share your thoughts.</p>
            </HairlineCard>
          ) : (
            <div className="space-y-3 max-h-[820px] overflow-y-auto pr-1">
              {history.map((item, i) => {
                const moodObj = MOODS.find((m) => m.label === item.mood);
                const catObj  = CATEGORIES.find((c) => c.label === item.category);
                const accent  = ACCENT_ROTATION[i % ACCENT_ROTATION.length];
                return (
                  <HairlineCard key={item.id} className="overflow-hidden p-0">
                    <div className="h-[2px] w-full" style={{ backgroundColor: accent }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          {moodObj && <span className="text-xl leading-none">{moodObj.emoji}</span>}
                          {catObj && (
                            <span className="text-xs px-2 py-0.5 rounded-full hairline bg-white/[0.03] text-muted-foreground">
                              {catObj.emoji} {catObj.label}
                            </span>
                          )}
                        </div>
                        {item.rating > 0 && (
                          <div className="flex shrink-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3.5 w-3.5 ${
                                  s <= item.rating
                                    ? "fill-[color:var(--pn-gold)] text-[color:var(--pn-gold)]"
                                    : "fill-white/[0.04] text-white/20"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed mb-3 line-clamp-4">
                        {item.feedback_text}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          weekday: "short", month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                  </HairlineCard>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default StudentFeedback;
