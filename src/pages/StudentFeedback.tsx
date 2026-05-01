import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, Sparkles, Heart, Loader2 } from "lucide-react";

// ── Constants ────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "Platform Experience", emoji: "✨", selectedCls: "bg-blue-50 border-blue-400 text-blue-700" },
  { label: "Counselor Support",   emoji: "🤝", selectedCls: "bg-emerald-50 border-emerald-400 text-emerald-700" },
  { label: "Essay Help",          emoji: "✍️", selectedCls: "bg-purple-50 border-purple-400 text-purple-700" },
  { label: "General Feedback",    emoji: "💬", selectedCls: "bg-orange-50 border-orange-400 text-orange-700" },
  { label: "Suggestions",         emoji: "💡", selectedCls: "bg-pink-50 border-pink-400 text-pink-700" },
];

const MOODS = [
  { emoji: "😍", label: "Love it!",        selectedCls: "bg-pink-100 border-pink-400" },
  { emoji: "😊", label: "Happy",           selectedCls: "bg-green-100 border-green-400" },
  { emoji: "😐", label: "Neutral",         selectedCls: "bg-blue-100 border-blue-400" },
  { emoji: "😕", label: "Could be better", selectedCls: "bg-orange-100 border-orange-400" },
  { emoji: "😤", label: "Frustrated",      selectedCls: "bg-red-100 border-red-400" },
];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Amazing! 🎉"];

const CARD_GRADIENTS = [
  "from-purple-400 to-pink-500",
  "from-blue-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500",
];

// ── Component ────────────────────────────────────────────────────

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

    // Fire edge function (best-effort — don't block on failure)
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
    toast({ title: "Thank you! 🎉", description: "Your feedback has been received." });
    setTimeout(() => setJustSubmitted(false), 3000);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-100 shadow-sm mb-4">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-semibold text-purple-600">Your Voice Matters</span>
        </div>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2">
          Share Your Thoughts! 💬
        </h1>
        <p className="text-muted-foreground text-lg">
          Hey {firstName}! Your feedback helps us build the best experience for you. 🌟
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Left: Form ──────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-5">

          {/* Star Rating */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" />
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <span className="text-2xl">⭐</span> How would you rate your experience?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Tap a star to rate</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s === rating ? 0 : s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-10 w-10 transition-colors duration-150 ${
                        s <= (hovered || rating)
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                          : "fill-gray-100 text-gray-200"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-semibold text-amber-600 animate-in fade-in">
                    {RATING_LABELS[rating]}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-purple-400 via-violet-400 to-pink-400" />
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <span className="text-2xl">🏷️</span> What is your feedback about?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Pick a category (optional)</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setCategory(category === cat.label ? "" : cat.label)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200
                      ${category === cat.label
                        ? `${cat.selectedCls} scale-105 shadow-md`
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mood */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400" />
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <span className="text-2xl">🎭</span> How are you feeling today?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Your mood (optional)</p>
              <div className="flex flex-wrap gap-3">
                {MOODS.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setMood(mood === m.label ? "" : m.label)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border-2 transition-all duration-200
                      ${mood === m.label
                        ? `${m.selectedCls} scale-110 shadow-md`
                        : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <span className="text-3xl leading-none">{m.emoji}</span>
                    <span className="text-xs font-medium text-gray-500 whitespace-nowrap mt-1">{m.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Text */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400" />
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <span className="text-2xl">💌</span> Tell us more
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share anything on your mind — we read every single word!
              </p>
              <Textarea
                placeholder="What's been great? What could be improved? Any ideas or suggestions? Go for it..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[140px] resize-none border-gray-200 focus:border-purple-300 rounded-xl text-base"
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">{feedbackText.length} characters</p>
            </CardContent>
          </Card>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !feedbackText.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg focus:outline-none
              ${justSubmitted
                ? "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-emerald-200"
                : "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 hover:shadow-xl hover:-translate-y-0.5 hover:shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              }`}
          >
            {submitting ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Sending your feedback…</>
            ) : justSubmitted ? (
              <>🎉 Thank you so much!</>
            ) : (
              <><Send className="h-5 w-5" /> Submit Feedback</>
            )}
          </button>
        </div>

        {/* ── Right: History ───────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Heart className="h-5 w-5 text-pink-500 fill-pink-400" />
            <h2 className="font-bold text-xl text-foreground">Your Past Feedback</h2>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
            </div>
          ) : history.length === 0 ? (
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm text-center py-12 px-6">
              <p className="text-5xl mb-4">🌟</p>
              <p className="font-semibold text-foreground mb-1">No feedback yet</p>
              <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
            </Card>
          ) : (
            <div className="space-y-4 max-h-[820px] overflow-y-auto pr-1">
              {history.map((item, i) => {
                const moodObj = MOODS.find((m) => m.label === item.mood);
                const catObj  = CATEGORIES.find((c) => c.label === item.category);
                return (
                  <Card key={item.id} className="border-0 shadow-md overflow-hidden bg-white/90">
                    <div className={`h-2 bg-gradient-to-r ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`} />
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {moodObj && <span className="text-xl">{moodObj.emoji}</span>}
                          {catObj && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                              {catObj.emoji} {catObj.label}
                            </span>
                          )}
                        </div>
                        {item.rating > 0 && (
                          <div className="flex shrink-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3.5 w-3.5 ${s <= item.rating ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed mb-3 line-clamp-4">
                        {item.feedback_text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          weekday: "short", month: "short", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;
